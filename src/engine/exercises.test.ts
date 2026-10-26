import { expect, it } from "vitest";
import { exerciseGame, exerciseComplete, exerciseKinds } from "./exercises";
import { reducer } from "./game";
import { conserved } from "./test-helpers";
import { validSave } from "../lib/storage";
it("creates conserved exercises with valid snapshots and no premature success", () => {
  for (const kind of exerciseKinds) {
    const s = exerciseGame(kind);
    conserved(s);
    expect(validSave(s)).toBe(true);
    expect(exerciseComplete(kind, s)).toBe(false);
  }
});
it("checks each real-engine solution and rejects a short opening and incomplete joker reuse", () => {
  let s = exerciseGame("opening");
  s = reducer(s, { type: "move", ids: [0, 1, 2], target: "new" });
  expect(exerciseComplete("opening", s)).toBe(false);
  s = reducer(s, { type: "resetTurn" });
  s = reducer(s, { type: "move", ids: [9, 35, 61], target: "new" });
  expect(exerciseComplete("opening", s)).toBe(true);
  conserved(s);
  s = reducer(exerciseGame("extend"), {
    type: "move",
    ids: [3],
    target: "exercise-run",
  });
  expect(exerciseComplete("extend", s)).toBe(true);
  conserved(s);
  s = exerciseGame("repair");
  s = reducer(s, { type: "move", ids: [1], target: s.table[0].id });
  expect(exerciseComplete("repair", s)).toBe(true);
  conserved(s);
  s = reducer(exerciseGame("joker"), {
    type: "move",
    ids: [4],
    target: "exercise-wild",
  });
  expect(exerciseComplete("joker", s)).toBe(false);
  s = reducer(s, { type: "move", ids: [104, 30, 56], target: "new" });
  expect(exerciseComplete("joker", s)).toBe(true);
  conserved(s);
});
it("allows rebuilding the gap exercise after a safe Reset", () => {
  let s = reducer(exerciseGame("repair"), { type: "resetTurn" });
  s = reducer(s, { type: "move", ids: [0, 1, 2], target: "new" });
  expect(exerciseComplete("repair", s)).toBe(true);
  conserved(s);
});
