import { it, expect } from "vitest";
import { fixture } from "../engine/test-helpers";
import { reducer } from "../engine/game";
import { publicTurn, observeTurns, recentTurns } from "./recentTurns";
it("projects only public completed boards and literal actor names, never the unfinished draft", () => {
  const before = fixture([3, 12], [{ id: "run", tiles: [0, 1, 2] }], true);
  before.players[before.current].name = "constructor";
  const draft = reducer(before, { type: "move", ids: [3], target: "run" }),
    after = reducer(draft, { type: "endTurn" });
  const raw = JSON.stringify(draft),
    frame = publicTurn(draft, after)!;
  expect(frame.actor).toBe("constructor");
  expect(frame.before).toEqual(before.table);
  expect(frame.after).toEqual(after.table);
  expect(frame.added).toEqual([3]);
  expect(Object.keys(frame).sort()).toEqual([
    "actor",
    "added",
    "after",
    "before",
    "turn",
  ]);
  expect(JSON.stringify(draft)).toBe(raw);
  frame.after[0].tiles.push(105);
  expect(after.table[0].tiles).not.toContain(105);
});
it("ignores edits, rejected actions, seed changes and missing turns", () => {
  const s = fixture([3, 12], [{ id: "run", tiles: [0, 1, 2] }], true),
    draft = reducer(s, { type: "move", ids: [3], target: "run" });
  expect(publicTurn(s, draft)).toBeNull();
  expect(
    publicTurn(s, { ...s, seed: s.seed + 1, turn: s.turn + 1 }),
  ).toBeNull();
  expect(publicTurn(s, { ...s, turn: s.turn + 2 })).toBeNull();
});
it("does not depend on unseen allocations and records the final winning turn", () => {
  const s = fixture([3], [{ id: "run", tiles: [0, 1, 2] }], true),
    draft = reducer(s, { type: "move", ids: [3], target: "run" }),
    end = reducer(draft, { type: "endTurn" });
  expect(end.phase).toBe("over");
  const shifted = structuredClone(end);
  shifted.players[1 - s.current].rack.reverse();
  shifted.pool.reverse();
  expect(publicTurn(draft, shifted)).toEqual(publicTurn(draft, end));
});
it("bounds the visit ring, deduplicates StrictMode observation and clears on replacement", () => {
  let s = fixture([12], [{ id: "run", tiles: [0, 1, 2] }], true);
  observeTurns(s, 100);
  for (let n = 0; n < 9; n++) {
    const next = {
      ...s,
      turn: s.turn + 1,
      current: 1 - s.current,
      turnStart: {
        table: structuredClone(s.table),
        rack: [...s.players[1 - s.current].rack],
      },
    };
    observeTurns(next, 100);
    observeTurns(next, 100);
    s = next;
  }
  expect(recentTurns(s, 100)).toHaveLength(6);
  expect(recentTurns(s, 101)).toEqual([]);
  observeTurns(s, 101);
  expect(recentTurns(s, 101)).toEqual([]);
});
