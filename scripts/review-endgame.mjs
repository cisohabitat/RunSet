// Offline endgame audit. No servers, hidden-rack strategy input or win-rate tuning.
import { build } from "vite";
import { mkdtemp, rm, readFile, writeFile, mkdir } from "node:fs/promises";
import { cpus, loadavg, tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")),
);
const seeds = Number(args.seeds ?? 4),
  first = Number(args["first-seed"] ?? 61001),
  budget = 380;
if (
  !Number.isInteger(seeds) ||
  seeds < 1 ||
  seeds > 20 ||
  !Number.isInteger(first) ||
  first < 1
)
  throw Error("Use --seeds=1..20 --first-seed=positive-integer");
if (args["baseline-ref"] && !args.baseline)
  throw Error(
    "--baseline-ref requires a compiled --baseline module; it is not fetched automatically",
  );
const output = args.out ?? "docs/ENDGAME_AUDIT.json",
  temporary = await mkdtemp(join(tmpdir(), "runset-endgame-"));
const levels = ["easy", "normal", "hard"],
  startedAt = new Date().toISOString(),
  startLoad = loadavg();
const sha = (s) => createHash("sha256").update(s).digest("hex");
const latency = (xs) =>
  Object.fromEntries(
    [0.5, 0.95, 0.99, 1].map((q, i) => [
      ["p50", "p95", "p99", "max"][i],
      xs.length
        ? +[...xs]
            .sort((a, b) => a - b)
            [Math.min(xs.length - 1, Math.floor(xs.length * q))].toFixed(2)
        : null,
    ]),
  );
const redacted = (s) => {
  const safe = structuredClone(s);
  safe.history = [];
  safe.log = [];
  safe.players.forEach((p, i) => {
    if (i !== s.current) p.rack = [];
  });
  return safe;
};
try {
  await build({
    configFile: false,
    logLevel: "error",
    build: {
      ssr: "scripts/endgame-entry.ts",
      outDir: temporary,
      emptyOutDir: true,
      minify: false,
      rollupOptions: { output: { entryFileNames: "engine.mjs" } },
    },
  });
  const engine = await import(
    pathToFileURL(join(temporary, "engine.mjs")).href
  );
  const baseline = args.baseline
    ? await import(pathToFileURL(args.baseline).href)
    : engine;
  const baselineBundleSha256 = sha(
    await readFile(args.baseline ?? join(temporary, "engine.mjs")),
  );
  const {
    newGame,
    reducer,
    turnCheck,
    inspectMeld,
    planBot,
    endgameCases,
    endgameWitness,
    validSave,
  } = engine;
  const conserve = (s) => {
    const ids = [
      ...s.pool,
      ...s.players.flatMap((p) => p.rack),
      ...s.table.flatMap((m) => m.tiles),
    ];
    if (
      ids.length !== 106 ||
      new Set(ids).size !== 106 ||
      !s.table.every((m) => inspectMeld(m.tiles).valid)
    )
      throw Error("Invalid physical inventory/table");
  };
  const call = (planner, s) => {
    const safe = redacted(s),
      before = JSON.stringify(safe),
      start = performance.now(),
      table = planner(safe, budget),
      ms = performance.now() - start;
    if (JSON.stringify(safe) !== before) throw Error("Mutated planner input");
    const ids = table.flatMap((m) => m.tiles),
      mandatory = s.table.flatMap((m) => m.tiles),
      rack = s.players[s.current].rack;
    if (
      new Set(ids).size !== ids.length ||
      new Set(table.map((m) => m.id)).size !== table.length ||
      mandatory.some((id) => !ids.includes(id)) ||
      ids.some((id) => !mandatory.includes(id) && !rack.includes(id))
    )
      throw Error("Invalid submitted inventory");
    const used = ids.filter((id) => rack.includes(id)).length;
    const draft = used ? reducer(s, { type: "applyPlan", table }) : s;
    if (
      used &&
      (draft === s ||
        !turnCheck(draft).valid ||
        draft.players[s.current].rack.length !== rack.length - used)
    )
      throw Error("Rejected original plan");
    if (!used && JSON.stringify(table) !== JSON.stringify(s.table))
      throw Error("Public-only rearrangement");
    conserve(draft);
    return { table, used, ms };
  };
  const tactical = [];
  for (const f of endgameCases()) {
    if (!validSave(f.state)) throw Error("Invalid tactical save");
    const before = call(baseline.planBot, f.state),
      after = call(planBot, f.state);
    if (
      f.finish
        ? after.used !== f.state.players[f.state.current].rack.length
        : after.used !== 0
    )
      throw Error(`Tactical objective failed: ${f.id}`);
    tactical.push({
      id: f.id,
      expectedFinish: f.finish,
      rackSize: f.state.players[f.state.current].rack.length,
      tableTiles: f.state.table.flatMap((m) => m.tiles).length,
      before: { used: before.used, latencyMs: +before.ms.toFixed(2) },
      after: { used: after.used, latencyMs: +after.ms.toFixed(2) },
    });
  }
  const rounds = [],
    positions = [],
    baselineTimes = Object.fromEntries(levels.map((l) => [l, []])),
    currentTimes = Object.fromEntries(levels.map((l) => [l, []]));
  const fingerprint = Object.fromEntries(
    await Promise.all(
      [
        "src/engine/bot.ts",
        "src/engine/solver.ts",
        "src/engine/game.ts",
        "src/engine/meld.ts",
        "src/engine/tiles.ts",
        "scripts/endgame-oracle.ts",
        "scripts/endgame-fixtures.ts",
      ].map(async (p) => [p, sha(await readFile(p))]),
    ),
  );
  const report = (complete) => ({
    startedAt,
    generatedAt: new Date().toISOString(),
    complete,
    environment: {
      node: process.version,
      cpu: cpus()[0]?.model,
      logicalCpuCount: cpus().length,
      loadAtStart: startLoad,
    },
    method: {
      seedsPerFormat: seeds,
      firstSeed: first,
      formats: ["mixed", "pairs"],
      requestedBudgetMs: 380,
      workCapMs: engine.BOT_WORK_BUDGET_MS,
      baselineRef: args["baseline-ref"] ?? "current",
      baselineBundleSha256,
      sourceFingerprint: fingerprint,
      description:
        "Baseline rounds, all six ordered assignments per deal and format. Current planner is compared on the exact recorded final empty-pool pass positions; round trajectories and winners are not replayed with the new strategy. Witness search is constructive and bounded to racks of at most eight; no global no-move proof.",
    },
    tactical,
    rounds,
    positions,
    latencyMs: {
      baselineRounds: Object.fromEntries(
        levels.map((l) => [
          l,
          {
            ...latency(baselineTimes[l]),
            calls: baselineTimes[l].length,
            over400: baselineTimes[l].filter((t) => t > 400).length,
          },
        ]),
      ),
      currentEndgames: Object.fromEntries(
        levels.map((l) => [
          l,
          {
            ...latency(currentTimes[l]),
            calls: currentTimes[l].length,
            over400: currentTimes[l].filter((t) => t > 400).length,
          },
        ]),
      ),
    },
    checks: {
      roundsComplete: rounds.length === seeds * 12,
      all106IdsConserved: true,
      allSubmittedPlansLegal: true,
      allPlanningInputsUnchanged: true,
      allWitnessesValidated: true,
      allTacticalObjectivesMet: true,
    },
    limitations: [
      "Seat-swapped rounds share deals and are correlated.",
      "Unseen audit deals are separate from the hand-constructed regression fixtures; no heuristic was tuned to wins.",
      "Witness patterns cover pair additions, one-tile transfers and duplicate-run splits, not every legal move.",
      "No witness does not establish that a position is impossible to play.",
      "Node/Linux timing is not physical Apple performance, battery life or human enjoyment.",
    ],
  });
  await mkdir(dirname(output), { recursive: true });
  for (const mode of ["mixed", "pairs"])
    for (let seed = first; seed < first + seeds; seed++) {
      const assignments = levels.flatMap((a) =>
        levels
          .filter((b) => b !== a)
          .map((b) =>
            mode === "pairs"
              ? [a, b]
              : [a, b, levels.find((c) => c !== a && c !== b)],
          ),
      );
      for (const seating of assignments) {
        let s = newGame("Audit", seating.length - 1, "normal", seed),
          moves = 0;
        s.players.forEach((p, i) => {
          p.bot = seating[i];
          p.name = seating[i];
        });
        const lastPass = new Map();
        conserve(s);
        while (s.phase === "playing" && moves < 1000) {
          const actual = call(baseline.planBot, s),
            level = s.players[s.current].bot;
          baselineTimes[level].push(actual.ms);
          if (actual.used) lastPass.clear();
          else if (!s.pool.length)
            lastPass.set(s.current, { state: s, actual });
          s = reducer(s, { type: "botTurn", table: actual.table });
          conserve(s);
          moves++;
        }
        if (s.phase !== "over") throw Error("Unfinished baseline round");
        const blocked = s.passes >= s.players.length;
        rounds.push({
          mode,
          seed,
          seating,
          moves,
          ending: blocked ? "blocked" : "rack-empty",
        });
        if (blocked) {
          if (lastPass.size !== s.players.length)
            throw Error("Incomplete final pass cycle");
          for (const { state, actual } of lastPass.values()) {
            const p = state.players[state.current],
              current = call(planBot, state);
            currentTimes[p.bot].push(current.ms);
            const witness = p.rack.length <= 8 ? endgameWitness(state) : null;
            let witnessUsed = null;
            if (witness) {
              const draft = reducer(state, {
                type: "applyPlan",
                table: witness,
              });
              if (draft === state || !turnCheck(draft).valid)
                throw Error("Invalid constructive witness");
              conserve(draft);
              witnessUsed =
                p.rack.length - draft.players[state.current].rack.length;
            }
            positions.push({
              mode,
              seed,
              seating,
              seat: state.current,
              turn: state.turn,
              level: p.bot,
              opened: p.melded,
              rackSize: p.rack.length,
              tableTiles: state.table.flatMap((m) => m.tiles).length,
              witnessChecked: p.rack.length <= 8,
              witnessUsed,
              knownFinish: witnessUsed === p.rack.length,
              baselineUsed: actual.used,
              currentUsed: current.used,
              currentMs: +current.ms.toFixed(2),
              ...(witness && p.bot === "hard"
                ? {
                    state: redacted(state),
                    witness,
                    proposedTable: current.table,
                  }
                : {}),
            });
          }
        }
        await writeFile(output, JSON.stringify(report(false), null, 2) + "\n");
        console.log(
          `${rounds.length}/${seeds * 12}: ${mode} ${seed} ${seating.join("/")} ${blocked ? "blocked" : "rack-empty"}`,
        );
      }
    }
  const final = report(true);
  await writeFile(output, JSON.stringify(final, null, 2) + "\n");
  console.log(`Complete: ${output}`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
