import { expect, it } from "vitest";
import { reducer } from "../engine/game";
import { fixture } from "../engine/test-helpers";
import { transitionCue } from "./sound";

it("sounds actual placement and undo, without replaying unchanged states or preferences", () => {
  const before = fixture([3], [{ id: "run", tiles: [0, 1, 2] }], true);
  const placed = reducer(before, { type: "move", ids: [3], target: "run" });
  expect(transitionCue(before, placed)).toBe("place");
  expect(transitionCue(placed, reducer(placed, { type: "undo" }))).toBe(
    "select",
  );
  expect(transitionCue(before, before)).toBeNull();
  expect(transitionCue(before, { ...before, coach: !before.coach })).toBeNull();
  expect(
    transitionCue(before, { ...before, seed: before.seed + 1 }),
  ).toBeNull();
});
it("does not report success for a rejected opening extension", () => {
  const before = fixture([3], [{ id: "run", tiles: [0, 1, 2] }], false);
  const rejected = reducer(before, { type: "move", ids: [3], target: "run" });
  expect(rejected.table).toEqual(before.table);
  expect(transitionCue(before, rejected)).toBe("invalid");
});
it("distinguishes a real draw from an empty-pool pass", () => {
  const before = fixture([3]);
  expect(transitionCue(before, reducer(before, { type: "draw" }))).toBe("draw");
  before.players[1 - before.current].rack.push(...before.pool.splice(0));
  expect(transitionCue(before, reducer(before, { type: "draw" }))).toBe("turn");
});
it("announces the human turn after a bot finishes, rather than every copied state", () => {
  const start = fixture([3]),
    bot = reducer(start, { type: "draw" });
  expect(bot.players[bot.current].bot).toBeTruthy();
  expect(transitionCue(bot, reducer(bot, { type: "draw" }))).toBe("turn");
  expect(transitionCue(bot, structuredClone(bot))).toBeNull();
});
it("celebrates the actual winner once and ignores reopening a completed result", () => {
  const start = fixture([9, 35, 61]);
  const placed = reducer(start, {
    type: "move",
    ids: [9, 35, 61],
    target: "new",
  });
  const finished = reducer(placed, { type: "endTurn" });
  expect(finished.phase).toBe("over");
  expect(transitionCue(placed, finished)).toBe("win");
  expect(transitionCue(finished, structuredClone(finished))).toBeNull();
  const botPlaced = structuredClone(placed),
    botFinished = structuredClone(finished);
  botPlaced.players[botPlaced.current].bot = "easy";
  botFinished.players[botPlaced.current].bot = "easy";
  expect(transitionCue(botPlaced, botFinished)).toBe("lose");
});
