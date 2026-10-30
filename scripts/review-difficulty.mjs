// Offline evaluation only: no servers, credentials, strategy changes, or tuning.
import { build } from "vite";
import { mkdtemp, rm, writeFile, mkdir, readFile } from "node:fs/promises";
import { cpus, tmpdir, loadavg } from "node:os";
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
if (args["draw-review"] !== undefined && !["true", "false"].includes(args["draw-review"]))
  throw Error("Use --draw-review=true|false.");
const drawReview = args["draw-review"] === "true";
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
  const {
    newGame,
    reducer,
    results,
    planBot,
    inspectMeld,
    turnCheck,
    BOT_WORK_BUDGET_MS,
  } = await import(pathToFileURL(join(temporary, "engine.mjs")).href);
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
        knownOpeningTurns: 0,
        missedKnownOpenings: 0,
        drawStreaks: [],
        drawsBeforeOpening: 0,
        drawsAfterOpening: 0,
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
    missedBaselineFinishes: 0,
    latencyWhenBaselineCouldEmptyRackMs: [],
  };
  const easyVsNormal = {
    compared: 0, moreTiles: 0, sameTiles: 0, fewerTiles: 0,
    drawsWithKnownNormalPlay: 0, extensionOnlyDraws: 0, newMeldDraws: 0,
    baselineCouldEmptyRack: 0, missedBaselineFinishes: 0,
  };
  const easyDrawExamples = [], easyMissedFinishExamples = [];
  const games = [],
    rejectionExamples = [],
    slowPlanExamples = [],
    baselineRejectionExamples = [],
    missedFinishExamples = [];
  const normalBaselineChecks = { compared: 0, rejected: 0 };
  const startedAt = new Date().toISOString();
  const hostLoadAtStart = loadavg();
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
  const evaluatorSource = await readFile("scripts/review-difficulty.mjs");
  const report = () => ({
    generatedAt: new Date().toISOString(),
    startedAt,
    complete: games.length === seeds * assignments.length,
    environment: {
      node: process.version,
      cpu: cpus()[0]?.model,
      platform: process.platform,
      logicalCpuCount: cpus().length,
      hostLoadAtStart,
      engineFingerprint,
    },
    method: {
      mode,
      firstSeed,
      seeds,
      assignments,
      planningBudgetMs: budget,
      effectiveWorkBudgetMs: Math.min(budget, BOT_WORK_BUDGET_MS),
      productionRedaction: true,
      drawReview,
      evaluatorFingerprint: createHash("sha256").update(evaluatorSource).digest("hex"),
      description:
        "All ordered seat assignments for each seeded deal, sequentially on one host. Same-input validated Normal baselines detect opening opportunities and compare post-opening Hard positions. Baseline calls are excluded from actual-plan latency. Original submitted plans are checked before reducer fallback. No bot strategy is modified." + (drawReview ? " Easy also receives a same-input validated Normal comparison on every personal turn; draw streaks and a count-only Easy trace are recorded." : ""),
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
            ...(drawReview ? {drawReview: {
              drawsBeforeOpening: m.drawsBeforeOpening,
              drawsAfterOpening: m.drawsAfterOpening,
              streaks: {count:m.drawStreaks.length, p50:percentile(m.drawStreaks,0.5), p95:percentile(m.drawStreaks,0.95), max:m.drawStreaks.length ? m.drawStreaks.reduce((maximum,n)=>Math.max(maximum,n),0) : 0},
            }} : {}),
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
            knownOpeningOpportunities: {
              turns: m.knownOpeningTurns,
              missed: m.missedKnownOpenings,
            },
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
    ...(drawReview ? {easyVsNormal, easyDrawExamples, easyMissedFinishExamples} : {}),
    games,
    rejectionExamples,
    slowPlanExamples,
    normalBaselineChecks,
    baselineRejectionExamples,
    missedFinishExamples,
    checks: {
      completedRounds: games.length,
      all106TilesConserved: true,
      allCompletedTablesLegal: true,
      allSubmittedPlansLegal: levels.every(
        (level) => metrics[level].rejectedPlans === 0,
      ),
      allPlanningInputsUnchanged: true,
      allNormalBaselinePlansLegal: normalBaselineChecks.rejected === 0,
      allRoundActionAccounting: true,
      ...(drawReview ? {allDrawStreakAccounting:true} : {}),
    },
    limitations: [
      "Node timing on this CPU is not physical iPhone/iPad performance.",
      `${seeds} distinct deals per format; seat-swapped rounds sharing a deal are correlated.`,
      "Time-bounded search may choose different moves under different host load; seeded deals alone do not reproduce scores exactly.",
      "A bot round win is not a measurement of human enjoyment or beginner accessibility.",
      "This sample does not cover four-player games or long multi-round matches.",
      ...(drawReview ? ["Draw streaks count consecutive personal turns, interrupted by a play or pass; a round ending can truncate a streak.", "A validated Normal play when Easy draws is a witnessed alternative, not proof of optimal play or a defect in Easy's deliberately limited style."] : []),
      "Known opening opportunities and post-opening Hard finishes use one validated Normal baseline, not an exhaustive optimal search or a strength ranking.",
    ],
  });
  await mkdir(dirname(output), { recursive: true });
  for (let seed = firstSeed; seed < firstSeed + seeds; seed++) {
    for (const seating of assignments) {
      let s = newGame("Review", seating.length - 1, "normal", seed),
        moves = 0;
      const turns = seating.map(() => 0),
        openings = seating.map(() => null);
      const roundStats = seating.map(() => ({
        plays: 0,
        draws: 0,
        passes: 0,
        tilesPlayed: 0,
        latencies: [],
        knownOpeningTurns: 0,
        missedKnownOpenings: 0,
        currentDrawStreak: 0,
        drawStreaks: [],
        drawsBeforeOpening: 0,
        drawsAfterOpening: 0,
      }));
      const easyTrace = [];
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
        let baseline, baselineFinishTable;
        let normalUsed, normalTableForEasy, normalExtensionOnly = false;
        let knownOpening = false;
        if (!p.melded || p.bot === "hard" || (drawReview && p.bot === "easy")) {
          const normal = structuredClone(safe);
          normal.players[seat].bot = "normal";
          const normalInput = JSON.stringify(normal);
          const baselineTable = planBot(normal, budget),
            proposedCount = baselineTable
              .flatMap((m) => m.tiles)
              .filter((id) => p.rack.includes(id)).length;
          const draft = proposedCount
            ? reducer(s, { type: "applyPlan", table: baselineTable })
            : s;
          if (JSON.stringify(normal) !== normalInput)
            throw Error("Normal baseline mutated input");
          normalBaselineChecks.compared++;
          const accepted =
            proposedCount > 0 &&
            draft !== s &&
            turnCheck(draft).valid &&
            draft.players[seat].rack.length === before - proposedCount;
          const rejectedBaseline = proposedCount
            ? !accepted
            : JSON.stringify(baselineTable) !== JSON.stringify(s.table);
          if (rejectedBaseline) {
            normalBaselineChecks.rejected++;
            if (baselineRejectionExamples.length < 3)
              baselineRejectionExamples.push({
                seed,
                seating,
                turn: s.turn,
                state: normal,
                proposedTable: baselineTable,
              });
          }
          knownOpening = !p.melded && accepted;
          normalUsed = accepted ? proposedCount : 0;
          normalTableForEasy = baselineTable;
          normalExtensionOnly = accepted && baselineTable
            .filter(m => m.tiles.some(id => p.rack.includes(id)))
            .every(m => s.table.some(old => old.id === m.id));
          if (p.bot === "hard" && p.melded) {
            baseline = accepted ? proposedCount : 0;
            baselineFinishTable = baselineTable;
            if (rejectedBaseline) hardVsNormal.normalBaselineRejected++;
          }
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
        if (elapsed > 400 && slowPlanExamples.length < 5)
          slowPlanExamples.push({
            difficulty: p.bot,
            seed,
            seating,
            turn: s.turn,
            elapsedMs: rounded(elapsed),
            state: safe,
          });
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
                state: safe,
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
            if (used < before) {
              hardVsNormal.missedBaselineFinishes++;
              if (missedFinishExamples.length < 3)
                missedFinishExamples.push({
                  seed,
                  seating,
                  turn: s.turn,
                  state: safe,
                  normalTable: baselineFinishTable,
                  actualTable: table,
                });
            }
          }
        }
        if (drawReview && p.bot === "easy" && p.melded) {
          easyVsNormal.compared++;
          easyVsNormal[used > normalUsed ? "moreTiles" : used < normalUsed ? "fewerTiles" : "sameTiles"]++;
          if (normalUsed === before && normalUsed > 0) {
            easyVsNormal.baselineCouldEmptyRack++;
            if (used < before) {
              easyVsNormal.missedBaselineFinishes++;
              if (easyMissedFinishExamples.length < 3) easyMissedFinishExamples.push({seed,seating,turn:s.turn,state:safe,normalTable:normalTableForEasy,actualTable:table});
            }
          }
          if (!used && s.pool.length && normalUsed > 0) {
            easyVsNormal.drawsWithKnownNormalPlay++;
            easyVsNormal[normalExtensionOnly ? "extensionOnlyDraws" : "newMeldDraws"]++;
            if (easyDrawExamples.filter(example=>example.normalExtensionOnly === normalExtensionOnly).length < 2) easyDrawExamples.push({seed,seating,turn:s.turn,normalUsed,normalExtensionOnly,state:safe,normalTable:normalTableForEasy});
          }
        }
        const next = reducer(s, { type: "botTurn", table });
        checkState(next);
        const m = metrics[p.bot];
        const round = roundStats[seat];
        if (drawReview) {
          const action = used ? "play" : s.pool.length ? "draw" : "pass";
          if (action === "draw") {
            round.currentDrawStreak++;
            const key = p.melded ? "drawsAfterOpening" : "drawsBeforeOpening";
            round[key]++; m[key]++;
          } else if (round.currentDrawStreak) {
            round.drawStreaks.push(round.currentDrawStreak);
            round.currentDrawStreak = 0;
          }
          if (p.bot === "easy") easyTrace.push({turn:s.turn,opened:p.melded,rackBefore:before,poolBefore:s.pool.length,action,played:used,normalUsed,normalExtensionOnly});
        }
        m.moves++;
        m.latencies.push(elapsed);
        round.latencies.push(elapsed);
        if (knownOpening) {
          m.knownOpeningTurns++;
          round.knownOpeningTurns++;
          if (!used) {
            m.missedKnownOpenings++;
            round.missedKnownOpenings++;
          }
        }
        if (used) {
          m.plays++;
          m.tilesPlayed += used;
          round.plays++;
          round.tilesPlayed += used;
          if (next.players[seat].rack.length !== before - used)
            throw Error("Submitted play not applied");
        } else if (s.pool.length) {
          m.draws++;
          round.draws++;
        } else {
          m.passes++;
          round.passes++;
        }
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
      roundStats.forEach((r, i) => {
        if (
          14 + r.draws - r.tilesPlayed !== s.players[i].rack.length ||
          r.plays + r.draws + r.passes !== turns[i]
        )
          throw Error("Round action accounting failed");
      });
      if (drawReview) for (let i = 0; i < seating.length; i++) {
        const r = roundStats[i];
        if (r.currentDrawStreak) r.drawStreaks.push(r.currentDrawStreak);
        if (r.drawStreaks.reduce((a,b)=>a+b,0) !== r.draws || r.drawsBeforeOpening + r.drawsAfterOpening !== r.draws)
          throw Error("Draw streak accounting failed");
        metrics[seating[i]].drawStreaks.push(...r.drawStreaks);
      }
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
        remainingTiles: Object.fromEntries(
          seating.map((level, i) => [level, s.players[i].rack.length]),
        ),
        actualActions: Object.fromEntries(
          seating.map((level, i) => {
            const r = roundStats[i];
            return [
              level,
              {
                plays: r.plays,
                draws: r.draws,
                passes: r.passes,
                tilesPlayed: r.tilesPlayed,
                knownOpeningTurns: r.knownOpeningTurns,
                missedKnownOpenings: r.missedKnownOpenings,
                ...(drawReview ? {drawStreaks:r.drawStreaks,drawsBeforeOpening:r.drawsBeforeOpening,drawsAfterOpening:r.drawsAfterOpening} : {}),
              },
            ];
          }),
        ),
        ...(drawReview ? {easyTrace} : {}),
        latencyMs: Object.fromEntries(
          seating.map((level, i) => [level, latency(roundStats[i].latencies)]),
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
