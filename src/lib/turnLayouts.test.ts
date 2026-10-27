import { expect, it } from "vitest";
import {
  turnLessons,
  turnLessonClue,
  turnLessonLayoutCopy,
} from "./turnLessons";
import {
  freshTurnPractice,
  replayTurnPractice,
  turnPracticeOutcome,
  type PracticeAction,
} from "./turnPractice";
import { turnLayoutId } from "./turnLayouts";
import { validSave } from "./storage";
import { translator } from "../i18n/translate";
import messages from "../i18n/zh-CN";
const solution: Record<string, PracticeAction[]> = {
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
  it(`keeps all four ${lesson} layouts conserved, solvable and translated`, () => {
    const t = translator(messages);
    for (const layout of [0, 1, 2, 3]) {
      expect(
        new Set(
          Array.from({ length: 106 }, (_, id) => turnLayoutId(id, layout)),
        ).size,
      ).toBe(106);
      const initial = freshTurnPractice("quiet", "你", lesson, layout);
      expect(validSave(initial.game)).toBe(true);
      const clue = turnLessonClue(lesson, initial.game, layout);
      expect(
        clue.ids.every(
          (id) =>
            initial.game.players[0].rack.includes(id) ||
            initial.game.table.some((m) => m.tiles.includes(id)),
        ),
      ).toBe(true);
      const actions = solution[lesson].map((a) =>
        a.type === "move"
          ? { ...a, ids: a.ids.map((id) => turnLayoutId(id, layout)) }
          : a,
      );
      const complete = replayTurnPractice({ ...initial.record, actions })!;
      expect(complete).not.toBeNull();
      expect(validSave(complete.game)).toBe(true);
      expect(turnPracticeOutcome(complete.game, lesson)).toBe("complete");
      const copy = turnLessonLayoutCopy(lesson, layout);
      for (const text of [copy.goal, copy.clue, copy.success]) {
        expect(t(text)).not.toBe(text);
        expect(t(text)).not.toMatch(/\b(red|blue|orange|black)\b/);
      }
    }
  });
it("preserves legacy layout zero and rejects malformed layout identifiers", () => {
  const legacy = freshTurnPractice().record;
  delete legacy.layout;
  expect(replayTurnPractice(legacy)!.record.layout).toBe(0);
  for (const layout of [-1, 4, 1.5, "1", null, true])
    expect(replayTurnPractice({ ...legacy, layout })).toBeNull();
  expect(
    freshTurnPractice("guided", "You", "opening", 1).game.players[0].rack,
  ).not.toEqual(freshTurnPractice().game.players[0].rack);
});
