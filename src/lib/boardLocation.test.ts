import { expect, it } from "vitest";
import { practiceGame } from "../engine/practice";
import { reducer } from "../engine/game";
import { latestEdit, tileLocation } from "./boardLocation";
it("locates only actual accepted physical edits and rejects no-ops, Undo and new turns", () => {
  const before = practiceGame(),
    after = reducer(before, { type: "move", ids: [9, 35, 61], target: "new" });
  expect(latestEdit(before, before)).toEqual([]);
  expect(latestEdit(before, after).map((x) => x.id)).toEqual([9, 35, 61]);
  expect(latestEdit(after, reducer(after, { type: "undo" }))).toEqual([]);
  expect(latestEdit(after, reducer(after, { type: "draw" }))).toEqual([]);
  expect(tileLocation(before, 9)).toBe("rack");
  expect(tileLocation(after, 9)).toBe(`meld:${after.table[0].id}`);
  expect(tileLocation(before, before.pool[0])).toBeUndefined();
});
it("finds hint placements from actual applyPlan history without optimistic requests", () => {
  const before = practiceGame(),
    after = reducer(before, {
      type: "applyPlan",
      table: [{ id: "planned", tiles: [9, 35, 61] }],
    });
  expect(latestEdit(before, after).map((x) => x.id)).toEqual([9, 35, 61]);
});
it("retains accepted-edit evidence at the bounded one-hundred snapshot limit", () => {
  let s = practiceGame();
  s.players[0].melded = true;
  for (let i = 0; i < 100; i++)
    s = reducer(s, { type: "move", ids: [9], target: i % 2 ? "rack" : "new" });
  expect(s.history).toHaveLength(100);
  const after = reducer(s, { type: "move", ids: [9], target: "new" });
  expect(after.history).toHaveLength(100);
  expect(latestEdit(s, after).map((x) => x.id)).toEqual([9]);
});
