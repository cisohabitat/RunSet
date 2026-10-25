import { it, expect } from "vitest";
import { lessonComplete, practiceGame } from "./practice";
import { validSave } from "../lib/storage";
import { reducer, turnCheck } from "./game";
import { conserved } from "./test-helpers";
it("creates isolated conserved practice lessons", () => {
  for (const lesson of ["basics", "jokers", "rearrange"] as const) {
    const s = practiceGame(lesson);
    conserved(s);
    expect(validSave(s)).toBe(true);
    expect(s.players[0].bot).toBeNull();
  }
});
it("supports a legal 36-point first lesson", () => {
  let s = practiceGame();
  for (const ids of [
    [9, 35, 61],
    [0, 1, 2],
  ])
    s = reducer(s, { type: "move", ids, target: "new" });
  expect(turnCheck(s).points).toBe(36);
  s = reducer(s, { type: "endTurn" });
  expect(s.players[0].melded).toBe(true);
  conserved(s);
});

it("requires joker retrieval and reuse, not just replacement", () => {
  let s = practiceGame("jokers");
  s = reducer(s, { type: "move", ids: [4], target: "practice-wild" });
  expect(lessonComplete("jokers", s)).toBe(false);
  s = reducer(s, { type: "move", ids: [104, 30, 56], target: "new" });
  expect(lessonComplete("jokers", s)).toBe(true);
  conserved(s);
});
it("requires two runs, not simply an extension", () => {
  let s = practiceGame("rearrange");
  const extension = reducer(s, {
    type: "move",
    ids: [5],
    target: "practice-run",
  });
  expect(lessonComplete("rearrange", extension)).toBe(false);
  s = reducer(s, { type: "move", ids: [3, 4, 5, 6], target: "new" });
  expect(lessonComplete("rearrange", s)).toBe(true);
  conserved(s);
});

it("does not count an invalid pile as a completed opening exercise", async () => {
  const { basicProgress } = await import("./practice");
  let s = practiceGame();
  s = reducer(s, { type: "move", ids: [9, 35, 61, 0, 1, 2], target: "new" });
  expect(basicProgress(s)).toBe(0);
  s = reducer(s, { type: "resetTurn" });
  s = reducer(s, { type: "move", ids: [9, 35, 61], target: "new" });
  expect(basicProgress(s)).toBe(1);
  s = reducer(s, { type: "move", ids: [0, 1, 2], target: "new" });
  expect(basicProgress(s)).toBe(2);
});
