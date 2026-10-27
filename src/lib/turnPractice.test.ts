import { expect, it } from "vitest";
import { reducer } from "../engine/game";
import { validSave } from "./storage";
import {
  freshTurnPractice,
  maxPracticeActions,
  practiceAction,
  practiceCanApply,
  replayTurnPractice,
  turnPracticeOutcome,
} from "./turnPractice";
it("replays a real full opening, Undo and Reset with all 106 physical tiles", () => {
  const initial = freshTurnPractice();
  const actions = [
    { type: "move", ids: [0], target: "new" },
    { type: "undo" },
    { type: "move", ids: [9], target: "new" },
    { type: "resetTurn" },
    { type: "move", ids: [9, 35, 61], target: "new" },
    { type: "endTurn" },
  ];
  const restored = replayTurnPractice({ ...initial.record, actions })!;
  expect(restored).not.toBeNull();
  expect(validSave(restored.game)).toBe(true);
  expect(turnPracticeOutcome(restored.game)).toBe("complete");
  expect(restored.game.players[0].melded).toBe(true);
  expect(restored.game.lastPlaced).toEqual([9, 35, 61]);
  expect(initial.game.table).toEqual([]);
});
it("distinguishes drawing and blocks penalty endings or further actions after completion", () => {
  const initial = freshTurnPractice("quiet");
  expect(initial.record.showSteps).toBe(false);
  expect(freshTurnPractice("quiet", "你").game.players[0].name).toBe("你");
  expect(replayTurnPractice(initial.record, "你")!.game.players[0].name).toBe(
    "你",
  );
  const invalid = reducer(initial.game, {
    type: "move",
    ids: [0],
    target: "new",
  });
  expect(practiceCanApply(invalid, { type: "endTurn" })).toBe(false);
  const drawn = replayTurnPractice({
    ...initial.record,
    actions: [{ type: "draw" }],
  })!;
  expect(turnPracticeOutcome(drawn.game)).toBe("drawn");
  expect(drawn.game.players[0].rack).toHaveLength(15);
  expect(
    replayTurnPractice({
      ...drawn.record,
      actions: [...drawn.record.actions, { type: "draw" }],
    }),
  ).toBeNull();
  expect(
    replayTurnPractice({ ...initial.record, actions: [{ type: "endTurn" }] }),
  ).toBeNull();
});
it("rejects arbitrary states, unbounded transcripts, forged actions and unavailable tiles", () => {
  const { record } = freshTurnPractice();
  for (const actions of [
    [{ type: "tick", now: 999999 }],
    [{ type: "botTurn", table: [] }],
    [{ type: "move", ids: [105], target: "new" }],
    [{ type: "move", ids: [9, 9], target: "new" }],
    [{ type: "move", ids: [9], target: "missing-group" }],
    Array.from({ length: maxPracticeActions + 1 }, () => ({ type: "undo" })),
  ])
    expect(replayTurnPractice({ ...record, actions })).toBeNull();
  expect(replayTurnPractice({ ...record, version: 2 })).toBeNull();
  expect(replayTurnPractice({ ...record, mode: "unknown" })).toBeNull();
  expect(replayTurnPractice({ ...record, showSteps: "false" })).toBeNull();
  expect(practiceAction({ type: "draw", at: 100 })).toEqual({ type: "draw" });
});
