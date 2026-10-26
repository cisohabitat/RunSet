// Summarize complete, fingerprint-matched reports without treating seats as deals.
import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const [mixedPath, pairsPath, out = "docs/QUALITY_BOTS_SUMMARY.json"] =
  process.argv.slice(2);
if (!mixedPath || !pairsPath)
  throw Error(
    "Usage: node scripts/summarize-difficulty.mjs mixed.json pairs.json [out.json]",
  );
const inputs = await Promise.all(
  [mixedPath, pairsPath].map(async (path) =>
    JSON.parse(await readFile(path, "utf8")),
  ),
);
for (const r of inputs) {
  if (
    !r.complete ||
    r.games.length !== r.method.seeds * r.method.assignments.length
  )
    throw Error("Incomplete report");
  for (const [name, fingerprint] of Object.entries(
    r.environment.engineFingerprint,
  )) {
    const current = createHash("sha256")
      .update(await readFile(`src/engine/${name}.ts`))
      .digest("hex");
    if (current !== fingerprint)
      throw Error(`Engine changed since measurement: ${name}`);
  }
}
if (inputs[0].method.mode !== "mixed" || inputs[1].method.mode !== "pairs")
  throw Error("Expected mixed then pairs reports");
if (
  inputs[0].method.firstSeed !== inputs[1].method.firstSeed ||
  inputs[0].method.seeds !== inputs[1].method.seeds
)
  throw Error("Different seed blocks");
function describe(r) {
  const relevant = r.games.filter(
    (g) => g.seating.includes("hard") && g.seating.includes("normal"),
  );
  const blocks = [...new Set(relevant.map((g) => g.seed))].map((seed) => {
    const games = relevant.filter((g) => g.seed === seed);
    return {
      seed,
      hard: games.filter((g) => g.winner === "hard").length,
      normal: games.filter((g) => g.winner === "normal").length,
    };
  });
  return {
    rounds: r.games.length,
    distinctDeals: r.method.seeds,
    turns: r.games.reduce((n, g) => n + g.moves, 0),
    endings: Object.fromEntries(
      ["blocked", "rack-empty"].map((kind) => [
        kind,
        r.games.filter((g) => g.ending === kind).length,
      ]),
    ),
    lowestRackTies: r.games.filter((g) => g.lowestRackTie).length,
    difficulties: r.summary,
    hardVsNormalSeedBlocks: {
      hardLed: blocks.filter((b) => b.hard > b.normal).length,
      normalLed: blocks.filter((b) => b.normal > b.hard).length,
      tied: blocks.filter((b) => b.hard === b.normal).length,
      blocks,
    },
    samePositionComparison: r.hardVsNormal,
    checks: r.checks,
  };
}
const report = {
  sources: [mixedPath, pairsPath],
  method: {
    firstSeed: inputs[0].method.firstSeed,
    seedsPerFormat: inputs[0].method.seeds,
    planningBudgetMs: inputs[0].method.planningBudgetMs,
    effectiveWorkBudgetMs: inputs[0].method.effectiveWorkBudgetMs,
    independentUnit:
      "Deal seed; seat-swapped rounds and formats sharing a seed are correlated.",
  },
  mixed: describe(inputs[0]),
  pairs: describe(inputs[1]),
  limitations: [
    "Bot-only Node experiment; not human enjoyment, accessibility or physical-device timing.",
    "Time-bounded search varies with runtime load; no universal win-rate ordering is established.",
    "Seed-block lead counts include only rounds where Hard and Normal both participate.",
  ],
};
await writeFile(out, JSON.stringify(report, null, 2) + "\n");
console.log(
  JSON.stringify({
    out,
    mixed: report.mixed.rounds,
    pairs: report.pairs.rounds,
    totalTurns: report.mixed.turns + report.pairs.turns,
  }),
);
