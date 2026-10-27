import { expect, it } from "vitest";
import { dailyPuzzle, validDaily } from "./dailyPuzzle";
import {
  exerciseGame,
  exerciseClue,
  exerciseComplete,
} from "../engine/exercises";
import { reducer } from "../engine/game";
import { validSave } from "./storage";
it("uses local calendar days and keeps a chosen day reproducible across midnight", () => {
  const first = dailyPuzzle(new Date(2026, 9, 27, 0, 1)),
    last = dailyPuzzle(new Date(2026, 9, 27, 23, 59)),
    next = dailyPuzzle(new Date(2026, 9, 28, 0, 1));
  expect(first).toEqual(last);
  expect(first.date).toBe("2026-10-27");
  expect(next.kind).not.toBe(first.kind);
  expect(validDaily(first.date, first.kind, first.code)).toBe(true);
  expect(validDaily(next.date, first.kind, first.code)).toBe(false);
  expect(dailyPuzzle(new Date(2028, 1, 29)).date).toBe("2028-02-29");
});
it("produces conserved solvable puzzles across forty dates and all four goals", () => {
  const kinds = new Set<string>();
  for (let day = 1; day <= 40; day++) {
    const daily = dailyPuzzle(new Date(2026, 9, day));
    kinds.add(daily.kind);
    expect(daily.code).toBeGreaterThanOrEqual(1);
    expect(daily.code).toBeLessThanOrEqual(999999);
    let game = exerciseGame(daily.kind, daily.code);
    expect(validSave(game)).toBe(true);
    const target = daily.kind === "opening" ? "new" : game.table[0].id;
    game = reducer(game, {
      type: "move",
      ids: exerciseClue(daily.kind, game),
      target,
    });
    if (daily.kind === "joker")
      game = reducer(game, {
        type: "move",
        ids: exerciseClue(daily.kind, game),
        target: "new",
      });
    expect(exerciseComplete(daily.kind, game)).toBe(true);
    expect(validSave(game)).toBe(true);
  }
  expect(kinds.size).toBe(4);
});
it("rejects malformed or mismatched persisted daily labels", () => {
  for (const date of [null, 42, "2026-02-30", "bad", "2026-1-1"])
    expect(validDaily(date, "opening", 4321)).toBe(false);
  const daily = dailyPuzzle(new Date(2026, 9, 27));
  expect(validDaily(daily.date, daily.kind, daily.code + 1)).toBe(false);
  expect(() => dailyPuzzle(new Date(NaN))).toThrow(RangeError);
});
