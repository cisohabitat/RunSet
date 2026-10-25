import { it, expect } from "vitest";
import { practiceGame } from "./practice";
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
