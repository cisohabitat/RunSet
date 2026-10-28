import { expect, it } from "vitest";
import { fixture, conserved } from "../engine/test-helpers";
import { reducer, turnCheck } from "../engine/game";
import { positionPractice, positionPracticeAction } from "./positionPractice";
import { validSave } from "./storage";
it("copies an unfinished human turn without clocks, hidden allocations, match or Undo history", () => {
  const source = reducer(
    fixture([3, 4, 5, 12], [{ id: "run", tiles: [0, 1, 2] }], true),
    { type: "move", ids: [3, 4], target: "new" },
  );
  source.turnSeconds = 120;
  source.deadline = 123456;
  const before = JSON.stringify(source),
    copy = positionPractice(source)!;
  expect(copy.players[0].rack).toEqual([5, 12]);
  expect(copy.table).toEqual(source.table);
  expect(copy.turnStart).toEqual(source.turnStart);
  expect(copy.history).toEqual([]);
  expect(copy.deadline).toBeUndefined();
  expect(copy.turnSeconds).toBeUndefined();
  const shifted = structuredClone(source),
    id = shifted.pool.pop()!;
  shifted.pool.push(shifted.players.find((p) => p.bot)!.rack.pop()!);
  shifted.players.find((p) => p.bot)!.rack.push(id);
  expect(positionPractice(shifted)).toEqual(copy);
  expect(JSON.stringify(source)).toBe(before);
  conserved(copy);
  expect(validSave(copy)).toBe(true);
  const placed = positionPracticeAction(copy, {
    type: "move",
    ids: [5],
    target: copy.table[1].id,
  }).game;
  expect(turnCheck(placed).valid).toBe(true);
  expect(positionPracticeAction(placed, { type: "endTurn" }).complete).toBe(
    true,
  );
  expect(JSON.stringify(source)).toBe(before);
});
it("keeps opening and joker restrictions and rejects incomplete checking without a penalty", () => {
  const source = fixture([9, 35, 61, 12]);
  const copy = positionPractice(source)!;
  const incomplete = positionPracticeAction(copy, {
    type: "move",
    ids: [9, 35],
    target: "new",
  }).game;
  const blocked = positionPracticeAction(incomplete, { type: "endTurn" });
  expect(blocked.game).toBe(incomplete);
  expect(blocked.complete).toBe(false);
  expect(blocked.feedback).not.toBe("");
  expect(
    positionPracticeAction(incomplete, { type: "undo" }).game.table,
  ).toEqual(copy.table);
  expect(
    positionPracticeAction(incomplete, { type: "resetTurn" }).game.players[0]
      .rack,
  ).toEqual(source.turnStart.rack);
  const jokers = positionPractice(
    fixture([6], [{ id: "run", tiles: [0, 1, 104, 3, 4, 5] }], true),
  )!;
  const split = positionPracticeAction(jokers, {
    type: "move",
    ids: [3, 4, 5, 6],
    target: "new",
  }).game;
  expect(turnCheck(split).valid).toBe(true);
  conserved(split);
  for (const type of [
    "draw",
    "botTurn",
    "applyPlan",
    "nextRound",
    "tick",
  ] as const) {
    const action =
      type === "tick"
        ? { type, now: 999999 }
        : type === "botTurn" || type === "applyPlan"
          ? { type, table: [] }
          : { type };
    expect(positionPracticeAction(copy, action).game).toBe(copy);
  }
});
it("does not offer a copy of a bot turn or malformed state", () => {
  const s = reducer(fixture([9, 35, 61, 12]), { type: "draw" });
  expect(positionPractice(s)).toBeNull();
  expect(positionPractice({ ...s, pool: [] })).toBeNull();
});
