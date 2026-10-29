import { expect, it } from "vitest";
import { newGame, reducer, turnCheck } from "../engine/game";
import { inspectMeld, type Meld } from "../engine/meld";
import { tiles } from "../engine/tiles";
import { validSave } from "./storage";
import { openingExample, jokerExample } from "./ruleExamples";
function example(rack: number[], table: Meld[] = [], opened = false) {
  const game = newGame("Example", 1, "easy", 5173);
  game.current = game.players.findIndex((p) => !p.bot);
  const used = new Set([...rack, ...table.flatMap((m) => m.tiles)]),
    remaining = tiles.map((t) => t.id).filter((id) => !used.has(id));
  game.table = structuredClone(table);
  game.players.forEach((p, i) => {
    p.rack = i === game.current ? [...rack] : remaining.splice(0, 14);
    p.melded = i === game.current && opened;
  });
  game.pool = remaining;
  game.turnStart = { table: structuredClone(table), rack: [...rack] };
  expect(validSave(game)).toBe(true);
  return game;
}
it("accepts the displayed 24 + 6 opening from the human's own rack", () => {
  let game = example(openingExample.flatMap((ids) => [...ids]));
  for (const ids of openingExample)
    game = reducer(game, { type: "move", ids: [...ids], target: "new" });
  expect(openingExample.map((ids) => inspectMeld([...ids]).points)).toEqual([
    24, 6,
  ]);
  expect(turnCheck(game)).toMatchObject({ valid: true, points: 30 });
  game = reducer(game, { type: "endTurn" });
  expect(game.phase).toBe("over");
  expect(validSave(game)).toBe(true);
});
it("rejects just the 24-point group as an opening", () => {
  let game = example([...openingExample[0], 12]);
  game = reducer(game, {
    type: "move",
    ids: [...openingExample[0]],
    target: "new",
  });
  expect(turnCheck(game)).toMatchObject({ valid: false, points: 24 });
  expect(turnCheck(game).reason).toContain("30");
  expect(validSave(game)).toBe(true);
});
it("accepts exact joker replacement and same-turn reuse as shown", () => {
  let game = example(
    [...jokerExample.rack],
    [{ id: "before", tiles: [...jokerExample.before] }],
    true,
  );
  expect(inspectMeld([...jokerExample.before]).values[104]).toBe(5);
  game = reducer(game, { type: "move", ids: [4], target: "before" });
  game = reducer(game, {
    type: "move",
    ids: [...jokerExample.reuse],
    target: "new",
  });
  expect(
    game.table
      .find((m) => m.id === "before")!
      .tiles.slice()
      .sort((a, b) => a - b),
  ).toEqual([...jokerExample.replacement]);
  expect(inspectMeld([...jokerExample.reuse]).values[104]).toBe(9);
  expect(turnCheck(game).valid).toBe(true);
  game = reducer(game, { type: "endTurn" });
  expect(game.phase).toBe("over");
  expect(validSave(game)).toBe(true);
});
