// Offline evaluation only: no servers, credentials, strategy changes, or tuning.
import { build } from "vite";
import { mkdtemp, rm, writeFile, mkdir, readFile } from "node:fs/promises";
import { cpus, tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")),
);
const seeds = Number(args.seeds ?? 10),
  budget = Number(args.budget ?? 380),
  firstSeed = Number(args["first-seed"] ?? 101);
if (
  !Number.isInteger(seeds) ||
  seeds < 1 ||
  seeds > 100 ||
  !Number.isInteger(firstSeed) ||
  firstSeed < 1 ||
  !Number.isFinite(budget) ||
  budget < 20 ||
  budget > 380
)
  throw Error(
    "Use --seeds=1..100 --first-seed=positive-integer --budget=20..380.",
  );
const mode = args.mode ?? "mixed";
if (!["mixed", "pairs"].includes(mode)) throw Error("Use --mode=mixed|pairs.");
const output = args.out ?? `docs/DIFFICULTY_${mode.toUpperCase()}.json`;
const temporary = await mkdtemp(join(tmpdir(), "runset-review-"));
const levels = ["easy", "normal", "hard"];
const assignments =
  mode === "mixed"
    ? levels.flatMap((a) =>
        levels
          .filter((b) => b !== a)
          .map((b) => [a, b, levels.find((c) => c !== a && c !== b)]),
      )
    : levels.flatMap((a) => levels.filter((b) => b !== a).map((b) => [a, b]));
const percentile = (values, p) =>
  values.length
    ? [...values].sort((a, b) => a - b)[
        Math.min(values.length - 1, Math.floor(values.length * p))
      ]
    : null;
const rounded = (n) => Math.round(n * 100) / 100;
const latency = (values) =>
  Object.fromEntries(
    ["p50", "p95", "p99", "max"].map((name, i) => [
      name,
      values.length
        ? rounded(
            i === 3
              ? values.reduce(
                  (maximum, value) => Math.max(maximum, value),
                  -Infinity,
                )
              : percentile(values, [0.5, 0.95, 0.99][i]),
          )
        : null,
    ]),
  );
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
  const { newGame, reducer, results, planBot, inspectMeld, turnCheck } =
    await import(pathToFileURL(join(temporary, "engine.mjs")).href);
  const metrics = Object.fromEntries(
    levels.map((level) => [
      level,
      {
        gamesPlayed: 0,
        wins: 0,
        moves: 0,
        plays: 0,
        draws: 0,
        passes: 0,
        tilesPlayed: 0,
        rejectedPlans: 0,
        rejectionReasons: {},
        latencies: [],
        openingPersonalTurns: [],
        remainingPoints: [],
      },
    ]),
  );
  const hardVsNormal = {
    compared: 0,
    normalBaselineRejected: 0,
    moreTiles: 0,
    sameTiles: 0,
    fewerTiles: 0,
    baselineCouldEmptyRack: 0,
    latencyWhenBaselineCouldEmptyRackMs: [],
  };
  const games = [],
    rejectionExamples = [];
  const startedAt = new Date().toISOString();
  const allIds = (s) => [
    ...s.pool,
    ...s.players.flatMap((p) => p.rack),
    ...s.table.flatMap((m) => m.tiles),
  ];
  const checkState = (s) => {
    const ids = allIds(s);
    if (
      ids.length !== 106 ||
      new Set(ids).size !== 106 ||
      !ids.every((id) => Number.isInteger(id) && id >= 0 && id < 106)
    )
      throw Error("Tile conservation failed");
    if (!s.table.every((m) => inspectMeld(m.tiles).valid))
      throw Error("Illegal completed table");
  };
  const engineFingerprint = Object.fromEntries(
    await Promise.all(
      ["bot", "solver", "game", "meld", "tiles"].map(async (name) => [
        name,
        createHash("sha256")
          .update(await readFile(`src/engine/${name}.ts`))
          .digest("hex"),
      ]),
    ),
  );
  const report = () => ({
    generatedAt: new Date().toISOString(),
    startedAt,
    complete: games.length === seeds * assignments.length,
    environment: {
      node: process.version,
      cpu: cpus()[0]?.model,
      platform: process.platform,
      engineFingerprint,
    },
    method: {
      mode,
      firstSeed,
      seeds,
      assignments,
      planningBudgetMs: budget,
      productionRedaction: true,
      description:
        "All ordered seat assignments for each seeded deal, sequentially on one host. Same-turn Normal comparison on post-opening Hard positions. Original submitted plans are checked before the reducer can turn a rejected plan into a draw. No bot strategy is modified.",
    },
    summary: Object.fromEntries(
      levels.map((level) => {
        const m = metrics[level];
        return [
          level,
          {
            gamesPlayed: m.gamesPlayed,
            wins: m.wins,
            winRate: m.gamesPlayed ? rounded(m.wins / m.gamesPlayed) : null,
            moves: m.moves,
            plays: m.plays,
            draws: m.draws,
            passes: m.passes,
            tilesPlayed: m.tilesPlayed,
            rejectedPlans: m.rejectedPlans,
            rejectionReasons: m.rejectionReasons,
            tilesPerPlay: m.plays ? rounded(m.tilesPlayed / m.plays) : null,
            openingPersonalTurns: {
              count: m.openingPersonalTurns.length,
              p50: percentile(m.openingPersonalTurns, 0.5),
              p95: percentile(m.openingPersonalTurns, 0.95),
            },
            meanRemainingPoints: m.remainingPoints.length
              ? rounded(
                  m.remainingPoints.reduce((a, b) => a + b, 0) /
                    m.remainingPoints.length,
                )
              : null,
            latencyMs: latency(m.latencies),
            plansOver400Ms: m.latencies.filter((n) => n > 400).length,
          },
        ];
      }),
    ),
    hardVsNormal: {
      ...hardVsNormal,
      latencyWhenBaselineCouldEmptyRackMs: latency(
        hardVsNormal.latencyWhenBaselineCouldEmptyRackMs,
      ),
    },
    games,
    rejectionExamples,
    checks: {
      completedRounds: games.length,
      all106TilesConserved: true,
      allCompletedTablesLegal: true,
      allSubmittedPlansLegal: levels.every(
        (level) => metrics[level].rejectedPlans === 0,
      ),
      allPlanningInputsUnchanged: true,
    },
    limitations: [
      "Node timing on this CPU is not physical iPhone/iPad performance.",
      "Only ten distinct deals per format by default; seat-swapped rounds sharing a deal are correlated.",
      "Time-bounded search may choose different moves under different host load; seeded deals alone do not reproduce scores exactly.",
      "A bot round win is not a measurement of human enjoyment or beginner accessibility.",
      "This sample does not cover four-player games or long multi-round matches.",
    ],
  });
  await mkdir(dirname(output), { recursive: true });
  for (let seed = firstSeed; seed < firstSeed + seeds; seed++) {
    for (const seating of assignments) {
      let s = newGame("Review", seating.length - 1, "normal", seed),
        moves = 0;
      const turns = seating.map(() => 0),
        openings = seating.map(() => null);
      s.players.forEach((p, i) => {
        p.bot = seating[i];
        p.name = p.bot;
      });
      checkState(s);
      while (s.phase === "playing" && moves < 1000) {
        const seat = s.current,
          p = s.players[seat],
          before = p.rack.length;
        turns[seat]++;
        const safe = structuredClone(s);
        safe.history = [];
        safe.log = [];
        safe.players.forEach((player, i) => {
          if (i !== seat) player.rack = [];
        });
        const input = JSON.stringify(safe);
        let baseline;
        if (p.bot === "hard" && p.melded) {
          const normal = structuredClone(safe);
          normal.players[seat].bot = "normal";
          const baselineTable = planBot(normal, budget),
            proposedCount = baselineTable
              .flatMap((m) => m.tiles)
              .filter((id) => p.rack.includes(id)).length;
          const draft = proposedCount
            ? reducer(s, { type: "applyPlan", table: baselineTable })
            : s;
          baseline = draft === s ? 0 : proposedCount;
          if (proposedCount && draft === s)
            hardVsNormal.normalBaselineRejected++;
        }
        const start = performance.now(),
          table = planBot(safe, budget),
          elapsed = performance.now() - start;
        if (JSON.stringify(safe) !== input)
          throw Error(`Planner mutated input: ${seed}/${seating}/${moves}`);
        const proposed = table.flatMap((m) => m.tiles),
          mandatory = s.table.flatMap((m) => m.tiles),
          available = new Set([...mandatory, ...p.rack]);
        if (
          new Set(proposed).size !== proposed.length ||
          new Set(table.map((m) => m.id)).size !== table.length ||
          proposed.some((id) => !available.has(id)) ||
          mandatory.some((id) => !proposed.includes(id)) ||
          !table.every((m) => inspectMeld(m.tiles).valid)
        )
          throw Error(`Invalid proposal: ${seed}/${seating}/${moves}`);
        let used = proposed.filter((id) => p.rack.includes(id)).length;
        if (used) {
          const trial = reducer(s, { type: "applyPlan", table });
          if (
            trial === s ||
            !turnCheck(trial).valid ||
            trial.players[seat].rack.length !== before - used
          ) {
            const candidate = structuredClone(s);
            candidate.table = table;
            candidate.players[seat].rack = p.rack.filter(
              (id) => !proposed.includes(id),
            );
            const reason =
              turnCheck(candidate).reason || "Shared validator rejected plan";
            const m = metrics[p.bot];
            m.rejectedPlans++;
            m.rejectionReasons[reason] = (m.rejectionReasons[reason] ?? 0) + 1;
            if (
              rejectionExamples.filter((e) => e.difficulty === p.bot).length < 2
            )
              rejectionExamples.push({
                difficulty: p.bot,
                seed,
                seating,
                turn: s.turn,
                reason,
                state: s,
                proposedTable: table,
              });
            used = 0; // Production safely draws/passes after rejecting this proposal.
          }
        } else if (JSON.stringify(table) !== JSON.stringify(s.table))
          throw Error("Rearranged without playing a rack tile");
        if (baseline !== undefined) {
          hardVsNormal.compared++;
          hardVsNormal[
            used > baseline
              ? "moreTiles"
              : used < baseline
                ? "fewerTiles"
                : "sameTiles"
          ]++;
          if (baseline === before) {
            hardVsNormal.baselineCouldEmptyRack++;
            hardVsNormal.latencyWhenBaselineCouldEmptyRackMs.push(elapsed);
          }
        }
        const next = reducer(s, { type: "botTurn", table });
        checkState(next);
        const m = metrics[p.bot];
        m.moves++;
        m.latencies.push(elapsed);
        if (used) {
          m.plays++;
          m.tilesPlayed += used;
          if (next.players[seat].rack.length !== before - used)
            throw Error("Submitted play not applied");
        } else if (s.pool.length) m.draws++;
        else m.passes++;
        if (!p.melded && next.players[seat].melded) {
          openings[seat] = turns[seat];
          m.openingPersonalTurns.push(turns[seat]);
        }
        s = next;
        moves++;
      }
      if (s.phase !== "over")
        throw Error(`Round failed to finish: ${seed}/${seating}`);
      const scores = results(s),
        winner = scores.find((p) => p.winner).bot;
      scores.forEach((p) => {
        metrics[p.bot].gamesPlayed++;
        metrics[p.bot].remainingPoints.push(p.total);
      });
      metrics[winner].wins++;
      const lowest = Math.min(...scores.map((p) => p.total));
      games.push({
        seed,
        seating,
        winner,
        moves,
        ending: s.players.some((p) => !p.rack.length)
          ? "rack-empty"
          : "blocked",
        lowestRackTie: scores.filter((p) => p.total === lowest).length > 1,
        remainingPoints: Object.fromEntries(
          scores.map((p) => [p.bot, p.total]),
        ),
        openingPersonalTurns: Object.fromEntries(
          seating.map((level, i) => [level, openings[i]]),
        ),
      });
      await writeFile(output, JSON.stringify(report(), null, 2) + "\n");
      console.log(
        `${mode} ${games.length}/${seeds * assignments.length}: deal ${seed}, ${seating.join("/")} -> ${winner}, ${moves} turns`,
      );
    }
  }
  console.log(`Complete: ${output}`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
