import { expect, it } from "vitest";
import { practiceGame } from "./practice";
import { reducer } from "./game";
import { narrateMove } from "./coaching";
it("does not attach opponent narration to a human completed turn", () => {
  const moved = reducer(practiceGame(), {
      type: "move",
      ids: [9, 35, 61],
      target: "new",
    }),
    ended = reducer(moved, { type: "endTurn" });
  expect(ended.lastPlaced).toHaveLength(3);
  expect(narrateMove(ended)).toBe(ended.notice);
});
it("describes only the completed bot snapshot and never rejection or Undo notices", () => {
  const base = practiceGame();
  base.players[0].bot = "easy";
  base.players[0].name = "Juniper";
  base.players[1].bot = null;
  base.players[1].name = "You";
  const ended = reducer(base, {
    type: "botTurn",
    table: [{ id: "bot-ten", tiles: [9, 35, 61] }],
  });
  expect(narrateMove(ended)).toContain(
    "They made a matching-number group (10, 10, 10).",
  );
  const blocked = reducer(ended, { type: "move", ids: [9], target: "rack" });
  expect(narrateMove(blocked)).toBe(blocked.notice);
  const draft = reducer(ended, {
      type: "move",
      ids: [ended.players[ended.current].rack[0]],
      target: "new",
    }),
    undone = reducer(draft, { type: "undo" });
  expect(narrateMove(undone)).toBe(undone.notice);
  const changed = structuredClone(ended);
  changed.table = [
    { id: "changed-one", tiles: [9] },
    { id: "changed-two", tiles: [35, 61] },
  ];
  expect(narrateMove(changed)).toBe(narrateMove(ended));
});
