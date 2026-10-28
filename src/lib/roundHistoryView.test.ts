import { expect, it } from "vitest";
import { roundHistoryView } from "./roundHistoryView";
import type { RoundRecord } from "./roundHistory";
const rounds: RoundRecord[] = [
  {
    id: "mixed",
    at: 1,
    round: 1,
    winner: 0,
    players: [
      { name: "constructor", bot: null, score: 30 },
      { name: "Pass", bot: "easy", score: -10 },
      { name: "red 7", bot: "hard", score: -20 },
    ],
  },
  {
    id: "normal",
    at: 2,
    round: 2,
    winner: 1,
    players: [
      { name: "你", bot: null, score: -5 },
      { name: "电脑阿明", bot: "normal", score: 5 },
    ],
  },
  {
    id: "hard",
    at: 3,
    round: 1,
    winner: 0,
    players: [
      { name: "You", bot: null, score: 12 },
      { name: "A", bot: "hard", score: -4 },
      { name: "B", bot: "hard", score: -8 },
    ],
  },
];
it("matches mixed-level rounds once, preserving actual newest-first order and names", () => {
  const before = JSON.stringify(rounds),
    hard = roundHistoryView(rounds, "hard");
  expect(hard.rounds.map((r) => r.id)).toEqual(["hard", "mixed"]);
  expect(hard.wins).toBe(2);
  expect(hard.total).toBe(3);
  expect(hard.rounds[1].players.map((p) => p.name)).toEqual([
    "constructor",
    "Pass",
    "red 7",
  ]);
  expect(JSON.stringify(rounds)).toBe(before);
});
it("counts retained visible records rather than lifetime wins or hidden difficulty comparisons", () => {
  expect(roundHistoryView(rounds, "easy").rounds.map((r) => r.id)).toEqual([
    "mixed",
  ]);
  expect(roundHistoryView(rounds, "normal").wins).toBe(0);
  expect(roundHistoryView(rounds, "all").rounds.map((r) => r.id)).toEqual([
    "hard",
    "normal",
    "mixed",
  ]);
  expect(roundHistoryView([], "all")).toEqual({
    rounds: [],
    wins: 0,
    total: 0,
  });
  expect(roundHistoryView(rounds.slice(0, 1), "normal")).toEqual({
    rounds: [],
    wins: 0,
    total: 1,
  });
});
