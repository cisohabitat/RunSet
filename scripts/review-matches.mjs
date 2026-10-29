// Offline complete-match verification; scripted legal human choices, not a strength study.
import { build } from "vite";
import { mkdtemp, rm, readFile, writeFile, mkdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { tmpdir, cpus, loadavg } from "node:os";
import { pathToFileURL } from "node:url";
import { createHash } from "node:crypto";
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")),
);
const out = args.out ?? "docs/MATCH_AUDIT.json",
  temporary = await mkdtemp(join(tmpdir(), "runset-matches-")),
  startedAt = new Date().toISOString(),
  load = loadavg();
const cases = [
  { seed: 71001, opponents: ["easy"], target: 500, timed: false },
  { seed: 71002, opponents: ["normal"], target: 100, timed: true },
  { seed: 71003, opponents: ["hard"], target: 200, timed: false },
  {
    seed: 71004,
    opponents: ["easy", "normal", "hard"],
    target: 500,
    timed: false,
  },
  {
    seed: 71005,
    opponents: ["normal", "normal", "normal"],
    target: 200,
    timed: true,
  },
  {
    seed: 71006,
    opponents: ["hard", "normal", "easy"],
    target: 200,
    timed: true,
  },
];
try {
  await build({
    configFile: false,
    logLevel: "error",
    build: {
      ssr: "scripts/match-entry.ts",
      outDir: temporary,
      emptyOutDir: true,
      minify: false,
      rollupOptions: { output: { entryFileNames: "engine.mjs" } },
    },
  });
  const {
    newGame,
    planBot,
    reducer,
    matchWinner,
    turnCheck,
    validSave,
    exportBackup,
    importBackup,
    expectedRound,
    inspectMeld,
  } = await import(pathToFileURL(join(temporary, "engine.mjs")).href);
  const summaries = [],
    times = { easy: [], normal: [], hard: [] };
  const check = (s) => {
    if (!validSave(s)) throw Error("Invalid match save");
    const ids = [
      ...s.pool,
      ...s.players.flatMap((p) => p.rack),
      ...s.table.flatMap((m) => m.tiles),
    ];
    if (ids.length !== 106 || new Set(ids).size !== 106)
      throw Error("Lost physical tile");
    if (s.match.rounds.some((r) => r.scores.reduce((a, b) => a + b, 0) !== 0))
      throw Error("Non-zero-sum round");
    if (
      s.match.totals.some(
        (n, i) => n !== s.match.rounds.reduce((a, r) => a + r.scores[i], 0),
      )
    )
      throw Error("Wrong aggregate");
  };
  const fingerprints = Object.fromEntries(
    await Promise.all(
      [
        "src/engine/game.ts",
        "src/engine/bot.ts",
        "src/engine/solver.ts",
        "src/lib/storage.ts",
        "scripts/match-fixtures.ts",
      ].map(async (p) => [
        p,
        createHash("sha256")
          .update(await readFile(p))
          .digest("hex"),
      ]),
    ),
  );
  const percentile = (xs, p) =>
    xs.length
      ? [...xs].sort((a, b) => a - b)[
          Math.min(xs.length - 1, Math.floor(xs.length * p))
        ]
      : 0;
  const report = (complete) => ({
    startedAt,
    generatedAt: new Date().toISOString(),
    complete,
    environment: {
      node: process.version,
      cpu: cpus()[0]?.model,
      logicalCpuCount: cpus().length,
      loadAtStart: load,
    },
    method: {
      description:
        "Six complete seeded matches from normal deals. One human remains in every save and is driven by a redacted Normal planner as a legal scripted stand-in. Computers use their stated styles. Every proposal is checked before fallback. Timed cases restore an unfinished backup and expire the original deadline every 29 actions; backups also round-trip every 13 actions and at results.",
      requestedPlannerBudgetMs: 380,
      sourceFingerprints: fingerprints,
    },
    matches: summaries,
    latencyMs: Object.fromEntries(
      Object.entries(times).map(([level, xs]) => [
        level,
        {
          calls: xs.length,
          p50: +percentile(xs, 0.5).toFixed(2),
          p95: +percentile(xs, 0.95).toFixed(2),
          max: +Math.max(0, ...xs).toFixed(2),
          over400: xs.filter((n) => n > 400).length,
        },
      ]),
    ),
    checks: {
      allRequestedMatchesComplete: summaries.length === cases.length,
      all106IdsConserved: true,
      allSubmittedPlansLegal: true,
      allPlanningInputsUnchanged: true,
      allScoresIndependentlyRecalculated: true,
      allBackupsEqual: true,
      allOriginalDeadlinesEnforced: true,
      allSeatsAndStarterRotationsPreserved: true,
    },
    limitations: [
      "Six synthetic matches do not establish strength rankings or human enjoyment.",
      "The human is a scripted stand-in; this is not an older-player or native Mandarin study.",
      "Logical timer expiries do not measure physical background suspension or battery use.",
      "Node/Linux timing is not physical iPhone/iPad performance.",
    ],
  });
  await mkdir(dirname(out), { recursive: true });
  for (const c of cases) {
    let now = 1_000_000,
      s = newGame("Match audit", c.opponents.length, "easy", c.seed, {
        target: c.target,
        turnSeconds: c.timed ? 60 : undefined,
        now,
      }),
      turns = 0,
      backups = 0,
      expiries = 0;
    let nextOpponent = 0;
    s.players.forEach((p) => {
      if (p.bot) p.bot = c.opponents[nextOpponent++];
    });
    const seats = s.players.map((p) => ({ name: p.name, bot: p.bot })),
      rounds = [];
    check(s);
    const restore = (game) => {
      const copy = importBackup(exportBackup(game));
      if (JSON.stringify(copy) !== JSON.stringify(game))
        throw Error("Backup altered match");
      backups++;
      return copy;
    };
    while (matchWinner(s) === null && turns < 50000 && rounds.length < 1000) {
      while (s.phase === "playing" && turns < 50000) {
        if (c.timed && turns % 29 === 0) {
          const before = structuredClone(s),
            seat = s.current;
          const draft = reducer(s, {
            type: "move",
            ids: [s.players[seat].rack[0]],
            target: "new",
            at: now,
          });
          check(draft);
          const resumed = restore(draft);
          now = before.deadline;
          s = reducer(resumed, { type: "tick", now });
          if (
            JSON.stringify(s.table) !==
              JSON.stringify(before.turnStart.table) ||
            JSON.stringify(s.players[seat].rack) !==
              JSON.stringify([
                ...before.turnStart.rack,
                ...before.pool.slice(0, 1),
              ]) ||
            s.history.length
          )
            throw Error("Incorrect expiry rollback/draw");
          if (
            s.phase === "playing" &&
            (s.turn !== before.turn + 1 || s.deadline !== now + 60000)
          )
            throw Error("Expiry advanced incorrectly");
          expiries++;
        } else {
          const input = structuredClone(s),
            seat = s.current,
            level = input.players[seat].bot ?? "normal";
          input.history = [];
          input.log = [];
          input.players.forEach((p, i) => {
            if (i !== seat) p.rack = [];
          });
          input.players[seat].bot = level;
          const original = JSON.stringify(input),
            start = performance.now(),
            table = planBot(input, 380);
          times[level].push(performance.now() - start);
          if (JSON.stringify(input) !== original)
            throw Error("Planner mutated input");
          const mandatory = s.table.flatMap((m) => m.tiles),
            ids = table.flatMap((m) => m.tiles),
            rack = s.players[seat].rack;
          if (
            new Set(ids).size !== ids.length ||
            new Set(table.map((m) => m.id)).size !== table.length ||
            mandatory.some((id) => !ids.includes(id)) ||
            ids.some((id) => !mandatory.includes(id) && !rack.includes(id)) ||
            !table.every((m) => inspectMeld(m.tiles).valid)
          )
            throw Error("Invalid submitted inventory");
          const used = ids.filter((id) => rack.includes(id)).length,
            trial = used ? reducer(s, { type: "applyPlan", table }) : s;
          if (used && (trial === s || !turnCheck(trial).valid))
            throw Error("Rejected original plan");
          if (!used && JSON.stringify(table) !== JSON.stringify(s.table))
            throw Error("Rearranged without own play");
          now += 1000;
          s = reducer(s, { type: "botTurn", table, at: now });
        }
        turns++;
        check(s);
        if (turns % 13 === 0) s = restore(s);
      }
      if (s.phase !== "over") throw Error("Match turn cap reached");
      const expected = expectedRound(s),
        actual = s.match.rounds.at(-1);
      if (
        actual.winner !== expected.winner ||
        JSON.stringify(actual.scores) !== JSON.stringify(expected.scores)
      )
        throw Error("Incorrect independent round score/winner");
      const frozen = JSON.stringify(s);
      if (JSON.stringify(reducer(s, { type: "endTurn", at: now })) !== frozen)
        throw Error("Completed round credited twice");
      s = restore(s);
      rounds.push({
        round: s.match.round,
        winner: expected.winner,
        scores: expected.scores,
        totals: [...s.match.totals],
        ending: s.players.some((p) => !p.rack.length)
          ? "rack-empty"
          : "blocked",
        turns: s.turn,
      });
      const top = Math.max(...s.match.totals),
        leaders = s.match.totals
          .map((n, i) => (n === top ? i : -1))
          .filter((i) => i >= 0),
        winner = top >= c.target && leaders.length === 1 ? leaders[0] : null;
      if (matchWinner(s) !== winner) throw Error("Wrong target/tie completion");
      if (winner !== null) {
        if (reducer(s, { type: "nextRound", at: now + 1 }) !== s)
          throw Error("Dealt after champion");
        break;
      }
      const totals = [...s.match.totals],
        round = s.match.round + 1;
      now += 1000;
      s = reducer(s, { type: "nextRound", at: now });
      check(s);
      if (
        s.current !== (round - 1) % s.players.length ||
        s.players.some((p) => p.rack.length !== 14 || p.melded) ||
        s.pool.length !== 106 - 14 * s.players.length ||
        s.table.length ||
        s.history.length ||
        JSON.stringify(s.match.totals) !== JSON.stringify(totals) ||
        JSON.stringify(s.players.map((p) => ({ name: p.name, bot: p.bot }))) !==
          JSON.stringify(seats)
      )
        throw Error("Incorrect next deal/seat continuity");
      if (c.timed && s.deadline !== now + 60000)
        throw Error("Incorrect fresh round deadline");
    }
    if (matchWinner(s) === null) throw Error("Incomplete requested match");
    summaries.push({
      ...c,
      players: seats,
      rounds,
      turns,
      backups,
      expiries,
      winner: matchWinner(s),
    });
    await writeFile(out, JSON.stringify(report(false), null, 2) + "\n");
    console.log(
      `Match ${summaries.length}/${cases.length}: ${c.seed}, ${s.players.length} players, ${rounds.length} rounds, ${turns} actions, ${backups} restores, ${expiries} expiries`,
    );
  }
  await writeFile(out, JSON.stringify(report(true), null, 2) + "\n");
  console.log(`Complete: ${out}`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
