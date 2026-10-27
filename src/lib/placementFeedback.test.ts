import { expect, it } from "vitest";
import { practiceGame } from "../engine/practice";
import { reducer } from "../engine/game";
import { placementFeedback } from "./placementFeedback";
it("reports a new draft destination only after the reducer moved the physical tiles", () => {
  const before = practiceGame(),
    after = reducer(before, { type: "move", ids: [9, 35, 61], target: "new" });
  expect(placementFeedback(before, after, [9, 35, 61], "new")).toEqual({
    count: 3,
    group: after.table[0].id,
    index: 0,
  });
  expect(placementFeedback(before, before, [9, 35, 61], "new")).toBeNull();
});
it("describes returning draft tiles to the rack", () => {
  const before = reducer(practiceGame(), {
      type: "move",
      ids: [9],
      target: "new",
    }),
    after = reducer(before, { type: "move", ids: [9], target: "rack" });
  expect(placementFeedback(before, after, [9], "rack")).toEqual({
    count: 1,
    group: null,
    index: -1,
  });
});
it("does not confirm rejected, unchanged or expired-turn actions", () => {
  const before = practiceGame("rearrange");
  expect(
    placementFeedback(
      before,
      reducer(before, { type: "move", ids: [0], target: "rack" }),
      [0],
      "rack",
    ),
  ).toBeNull();
  expect(
    placementFeedback(
      before,
      reducer(before, { type: "move", ids: [0], target: before.table[0].id }),
      [0],
      before.table[0].id,
    ),
  ).toBeNull();
  expect(
    placementFeedback(before, reducer(before, { type: "draw" }), [0], "new"),
  ).toBeNull();
});
it("counts only newly relocated tiles when others were already in the destination", () => {
  const before = reducer(practiceGame(), {
      type: "move",
      ids: [9],
      target: "new",
    }),
    target = before.table[0].id,
    after = reducer(before, { type: "move", ids: [9, 35], target });
  expect(placementFeedback(before, after, [9, 35], target)).toEqual({
    count: 1,
    group: target,
    index: 0,
  });
});
