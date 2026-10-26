import { build } from "vite";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { cpus, tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
const args = Object.fromEntries(
  process.argv.slice(2).map((arg) => arg.replace(/^--/, "").split("=")),
);
const seeds = Math.max(1, Math.min(30, Number(args.seeds ?? 2))),
  budget = Math.max(20, Math.min(380, Number(args.budget ?? 380)));
if (!Number.isInteger(seeds) || !Number.isFinite(budget))
  throw Error("Use integer --seeds=1..30 and --budget=20..380.");
const temporary = await mkdtemp(join(tmpdir(), "runset-benchmark-"));
try {
  await build({
    configFile: false,
    logLevel: "error",
    build: {
      ssr: "scripts/benchmark-entry.ts",
      outDir: temporary,
      emptyOutDir: true,
      minify: false,
      rollupOptions: { output: { entryFileNames: "engine.mjs" } },
    },
  });
  const {
    newGame,
    reducer,
    results,
    turnCheck,
    planBot,
    BOT_WORK_BUDGET_MS,
    inspectMeld,
    planHint,
    practiceGame,
  } = await import(pathToFileURL(join(temporary, "engine.mjs")).href);
  const levels = ["easy", "normal", "hard"],
    metrics = Object.fromEntries(
      levels.map((level) => [
        level,
        {
          wins: 0,
          moves: 0,
          tilesPlayed: 0,
          draws: 0,
          passes: 0,
          latencies: [],
        },
      ]),
    ),
    games = [];
  const conserved = (s) => {
    const ids = [
      ...s.pool,
      ...s.players.flatMap((p) => p.rack),
      ...s.table.flatMap((m) => m.tiles),
    ];
    if (ids.length !== 106 || new Set(ids).size !== 106)
      throw Error("Tile conservation failed");
    if (!s.table.every((m) => inspectMeld(m.tiles).valid))
      throw Error("Illegal table");
  };
  for (let seed = 1; seed <= seeds; seed++)
    for (let rotation = 0; rotation < 3; rotation++) {
      let s = newGame("Benchmark", 2, "normal", seed),
        moves = 0;
      s.players.forEach((p, i) => {
        p.bot = levels[(i + rotation) % 3];
        p.name = p.bot;
      });
      while (s.phase === "playing" && moves < 1000) {
        const p = s.players[s.current],
          before = p.rack.length;
        const safe = structuredClone(s);
        safe.history = [];
        safe.log = [];
        safe.players.forEach((player, i) => {
          if (i !== safe.current) player.rack = [];
        });
        const input = JSON.stringify(safe),
          start = performance.now(),
          table = planBot(safe, budget),
          elapsed = performance.now() - start;
        if (JSON.stringify(safe) !== input)
          throw Error("Planner mutated input");
        // Validate the submitted proposal before botTurn can safely convert an
        // invalid move into a draw. A legal final table alone misses that bug.
        const proposed = table.flatMap((m) => m.tiles),
          mandatory = s.table.flatMap((m) => m.tiles),
          available = new Set([...mandatory, ...p.rack]);
        if (
          new Set(proposed).size !== proposed.length ||
          new Set(table.map((m) => m.id)).size !== table.length ||
          mandatory.some((id) => !proposed.includes(id)) ||
          proposed.some((id) => !available.has(id))
        )
          throw Error("Invalid submitted tile inventory");
        const used = proposed.filter((id) => p.rack.includes(id)).length;
        const trial = used ? reducer(s, { type: "applyPlan", table }) : s;
        if (
          used &&
          (trial === s ||
            !turnCheck(trial).valid ||
            trial.players[s.current].rack.length !== before - used)
        )
          throw Error("Rejected submitted bot plan");
        if (!used && JSON.stringify(table) !== JSON.stringify(s.table))
          throw Error("Rearranged without playing a rack tile");
        const next = reducer(s, { type: "botTurn", table });
        conserved(next);
        const after = next.players[s.current].rack.length,
          m = metrics[p.bot];
        if (used && after !== before - used)
          throw Error("Submitted bot play was not applied");
        m.moves++;
        m.latencies.push(elapsed);
        m.tilesPlayed += Math.max(0, before - after);
        if (after >= before) {
          if (s.pool.length) m.draws++;
          else m.passes++;
        }
        s = next;
        moves++;
      }
      if (s.phase !== "over") throw Error("Game did not finish");
      const winner = results(s).find((p) => p.winner).bot;
      metrics[winner].wins++;
      games.push({ seed, rotation, winner, moves });
      console.log(
        `Deal ${seed}, seat rotation ${rotation}: ${winner} wins in ${moves} moves`,
      );
    }
  const hints = [];
  for (const lesson of ["basics", "jokers", "rearrange"]) {
    const s = practiceGame(lesson),
      before = JSON.stringify(s),
      start = performance.now(),
      hint = planHint(s),
      elapsed = performance.now() - start;
    if (JSON.stringify(s) !== before) throw Error("Hint mutated state");
    let legal = true;
    if (hint.table) {
      const next = reducer(s, { type: "applyPlan", table: hint.table });
      conserved(next);
      legal =
        next !== s &&
        hint.used.length > 0 &&
        turnCheck(next).valid &&
        next.turn === s.turn &&
        next.current === s.current &&
        hint.used.every((id) => next.table.some((m) => m.tiles.includes(id)));
    }
    if (!legal) throw Error("Illegal hint");
    hints.push({
      case: lesson,
      proposed: !!hint.table,
      tiles: hint.used.length,
      latencyMs: +elapsed.toFixed(2),
      legal,
    });
  }
  const quantile = (values, p) =>
    values.slice().sort((a, b) => a - b)[
      Math.min(values.length - 1, Math.floor(values.length * p))
    ] ?? 0;
  const report = {
    generatedAt: new Date().toISOString(),
    environment: {
      node: process.version,
      cpu: cpus()[0]?.model,
      platform: process.platform,
    },
    method: {
      seeds,
      seatRotations: 3,
      planningBudgetMs: budget,
      productionRedaction: true,
      effectiveWorkBudgetMs: Math.min(budget, BOT_WORK_BUDGET_MS),
      description:
        "Same seeded deals with each difficulty rotated through every seat; exploratory sample, not proof of a strength ranking. Search is time bounded and may vary by machine.",
    },
    summary: Object.fromEntries(
      levels.map((level) => {
        const m = metrics[level];
        return [
          level,
          {
            wins: m.wins,
            winRate: +(m.wins / games.length).toFixed(3),
            moves: m.moves,
            tilesPlayed: m.tilesPlayed,
            draws: m.draws,
            passes: m.passes,
            latencyMs: {
              p50: +quantile(m.latencies, 0.5).toFixed(2),
              p95: +quantile(m.latencies, 0.95).toFixed(2),
              max: +Math.max(...m.latencies).toFixed(2),
            },
          },
        ];
      }),
    ),
    games,
    hints,
    checks: {
      allGamesFinished: true,
      allSubmittedPlansLegal: true,
      allPlanningInputsUnchanged: true,
      allTablesLegal: true,
      all106TilesConserved: true,
      allHintPlansLegal: true,
      hardPlansOver400Ms: metrics.hard.latencies.filter((n) => n > 400).length,
    },
    limitations: [
      "This is a Node benchmark on the recorded host, not an iPhone/iPad measurement.",
      "A small sample cannot establish reliable difficulty win-rate differences.",
      "Browser CPU-throttle responsiveness is tested separately in e2e/planning.spec.ts.",
    ],
  };
  const output = args.out ?? "docs/BENCHMARKS.json";
  await writeFile(output, JSON.stringify(report, null, 2) + "\n");
  console.log(`Benchmark report: ${output}`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
