import { expect, it } from "vitest";
import { decodeRackOrder, orderedRack } from "./rackOrder";
it("keeps manual physical IDs through removals, returns and new draws without mutating state", () => {
  const order = { seed: 7, mode: "manual" as const, ids: [3, 1, 2] },
    rack = [1, 2, 3, 4];
  expect(orderedRack(rack, order, 7)).toEqual([3, 1, 2, 4]);
  expect(orderedRack([2, 4], order, 7)).toEqual([2, 4]);
  expect(orderedRack([2, 1, 4, 3], order, 7)).toEqual([3, 1, 2, 4]);
  expect(orderedRack(rack, order, 8)).toEqual(rack);
  expect(rack).toEqual([1, 2, 3, 4]);
});
it("rejects malformed preferences and sorts newly drawn tiles in automatic modes", () => {
  for (const value of [
    null,
    "{",
    JSON.stringify({ seed: 1, mode: "manual", ids: [3, 3] }),
    JSON.stringify({ seed: 1, mode: "manual", ids: [106] }),
  ])
    expect(decodeRackOrder(value)).toBeNull();
  expect(
    orderedRack([3, 1, 0], { seed: 1, mode: "number", ids: [] }, 1),
  ).toEqual([0, 1, 3]);
  expect(
    decodeRackOrder(JSON.stringify({ seed: 0, mode: "color", ids: [] })),
  ).toEqual({ seed: 0, mode: "color", ids: [] });
});
