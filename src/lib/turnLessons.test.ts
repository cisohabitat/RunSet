import { expect, it } from "vitest";
import { reducer } from "../engine/game";
import { validSave } from "./storage";
import { turnLessons, turnLessonReady, type TurnLesson } from "./turnLessons";
import {
  freshTurnPractice,
  replayTurnPractice,
  turnPracticeOutcome,
  practiceCanApply,
  type PracticeAction,
} from "./turnPractice";
export const lessonSolutions: Record<TurnLesson, PracticeAction[]> = {
  opening: [
    { type: "move", ids: [9, 35, 61], target: "new" },
    { type: "endTurn" },
  ],
  extend: [
    { type: "move", ids: [5], target: "practice-run" },
    { type: "endTurn" },
  ],
  rearrange: [
    { type: "move", ids: [3, 4, 5, 6], target: "new" },
    { type: "endTurn" },
  ],
  joker: [
    { type: "move", ids: [4], target: "practice-wild" },
    { type: "move", ids: [104, 30, 56], target: "new" },
    { type: "endTurn" },
  ],
  draw: [{ type: "draw" }],
};
for (const lesson of turnLessons)
  it(`completes ${lesson} only through its real accepted turn`, () => {
    const initial = freshTurnPractice("guided", "你", lesson);
    expect(validSave(initial.game)).toBe(true);
    const restored = replayTurnPractice({
      ...initial.record,
      actions: lessonSolutions[lesson],
    })!;
    expect(restored).not.toBeNull();
    expect(validSave(restored.game)).toBe(true);
    expect(turnPracticeOutcome(restored.game, lesson)).toBe("complete");
    expect(restored.game.current).toBe(1);
    if (lesson === "draw")
      expect(restored.game.players[0].rack).toHaveLength(
        initial.game.players[0].rack.length + 1,
      );
    else expect(restored.game.lastPlaced.length).toBeGreaterThan(0);
  });
it("keeps legacy opening transcripts and rejects unknown lessons or a skipped joker goal", () => {
  const initial = freshTurnPractice();
  delete initial.record.lesson;
  expect(replayTurnPractice(initial.record)!.record.lesson).toBe("opening");
  expect(
    replayTurnPractice({ ...initial.record, lesson: "unknown" }),
  ).toBeNull();
  const joker = freshTurnPractice("guided", "You", "joker"),
    unrelated = reducer(joker.game, {
      type: "move",
      ids: [4, 30, 56],
      target: "new",
    });
  expect(turnLessonReady("joker", unrelated)).toBe(false);
  expect(practiceCanApply(unrelated, { type: "endTurn" }, "joker")).toBe(false);
  expect(
    replayTurnPractice({
      ...joker.record,
      actions: [
        { type: "move", ids: [4, 30, 56], target: "new" },
        { type: "endTurn" },
      ],
    }),
  ).toBeNull();
});
