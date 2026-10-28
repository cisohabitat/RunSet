import { it, expect } from "vitest";
import { fixture } from "../engine/test-helpers";
import { reducer } from "../engine/game";
import { lastPlay, lastPlayDestinations } from "./lastPlay";
function completed(rack = [9, 35, 61, 12]) {
  let s = fixture(rack);
  s = reducer(s, { type: "move", ids: [9, 35, 61], target: "new" });
  return reducer(s, { type: "endTurn" });
}
it("uses the completed snapshot while current draft groups change", () => {
  const s = completed();
  s.players[s.current].melded = true;
  const edited = reducer(s, { type: "move", ids: [9], target: "new" }),
    before = JSON.stringify(edited);
  expect(edited.table).not.toEqual(edited.turnStart.table);
  expect(lastPlay(edited).map((x) => x.tiles)).toEqual([
    [9, 35, 61],
    [9, 35, 61],
    [9, 35, 61],
  ]);
  expect(JSON.stringify(edited)).toBe(before);
});
it("uses the final table on a rack-empty finish instead of the old turn start", () => {
  const s = completed([9, 35, 61]);
  expect(s.phase).toBe("over");
  expect(s.turnStart.table).toHaveLength(0);
  expect(lastPlay(s).map((x) => x.id)).toEqual([9, 35, 61]);
});
it("does not invent a placement after a draw or inconsistent old metadata", () => {
  const s = completed();
  expect(lastPlay(reducer(s, { type: "draw" }))).toEqual([]);
  s.lastPlaced = [105];
  expect(lastPlay(s)).toEqual([]);
});

it("groups completed destinations once without reading current drafts or other racks", () => {
  const s = completed();
  s.players[s.current].melded = true;
  const draft = reducer(s, { type: "move", ids: [9], target: "new" });
  const before = JSON.stringify(draft);
  expect(lastPlayDestinations(draft)).toEqual([{ index: 0, tiles: [9, 35, 61], placed: [9, 35, 61] }]);
  draft.lastPlaced = [9, 9, 35, 61];
  expect(lastPlayDestinations(draft)[0].placed).toEqual([9, 35, 61]);
  draft.lastPlaced = [105];
  expect(lastPlayDestinations(draft)).toEqual([]);
  draft.lastPlaced = [9, 35, 61];
  expect(JSON.stringify(draft)).toBe(before);
});
