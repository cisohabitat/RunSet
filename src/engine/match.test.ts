import { it, expect } from "vitest";
import { newGame, reducer, matchWinner, type GameState } from "./game";
import { fixture, conserved } from "./test-helpers";
import { validSave } from "../lib/storage";
function wonRound(): GameState {
  let s = fixture([9, 35, 61]);
  s.match = {
    target: 500,
    round: 1,
    totals: s.players.map(() => 0),
    rounds: [],
  };
  s = reducer(s, { type: "move", ids: [9, 35, 61], target: "new" });
  return reducer(s, { type: "endTurn", at: 1234 });
}
it("sums zero-sum round scores once, persists and deals a conserved next round", () => {
  const s = wonRound();
  expect(s.match?.rounds).toHaveLength(1);
  expect(s.match!.totals.reduce((a, b) => a + b, 0)).toBe(0);
  expect(validSave(s)).toBe(true);
  expect(reducer(s, { type: "endTurn" }).match).toEqual(s.match);
  const next = reducer(s, { type: "nextRound", at: 5000 });
  expect(next.phase).toBe("playing");
  expect(next.match?.round).toBe(2);
  expect(next.match?.totals).toEqual(s.match?.totals);
  expect(next.players.map((p) => p.name)).toEqual(s.players.map((p) => p.name));
  expect(next.players.every((p) => p.rack.length === 14)).toBe(true);
  expect(next.current).toBe(1);
  conserved(next);
  expect(validSave(next)).toBe(true);
});
it("finishes a match at the target and refuses another round", () => {
  const s = wonRound();
  const winner = s.match!.totals.indexOf(Math.max(...s.match!.totals));
  s.match!.target = 100;
  s.match!.totals[winner] = 100;
  expect(matchWinner(s)).toBe(winner);
  expect(reducer(s, { type: "nextRound" })).toEqual(s);
});
it("draws and restores edits at timeout, then advances its deadline", () => {
  let s = fixture([9, 35, 61, 0]);
  s.turnSeconds = 60;
  s.deadline = 60000;
  const initial = structuredClone(s);
  s = reducer(s, { type: "move", ids: [9, 35, 61], target: "new" });
  expect(reducer(s, { type: "tick", now: 59999 })).toEqual(s);
  const next = reducer(s, { type: "tick", now: 60000 });
  expect(next.players[initial.current].rack).toHaveLength(5);
  expect(next.table).toEqual(initial.table);
  expect(next.current).not.toBe(initial.current);
  expect(next.deadline).toBe(120000);
  expect(next.history).toEqual([]);
  conserved(next);
});
it("has no timer by default and conserves all tiles with a timed match", () => {
  const s = newGame("You", 2, "normal", 99);
  expect(reducer(s, { type: "tick", now: Date.now() })).toEqual(s);
  const timed = newGame("You", 2, "normal", 99, {
    target: 100,
    turnSeconds: 120,
    now: 1000,
  });
  expect(timed.deadline).toBe(121000);
  expect(validSave(timed)).toBe(true);
  conserved(timed);
});
it("rejects inconsistent match scores and timer metadata on load", () => {
  const s = wonRound();
  s.match!.totals[0]++;
  expect(validSave(s)).toBe(false);
  const timer = newGame("You", 1, "easy", 1, { turnSeconds: 60 });
  timer.deadline = NaN;
  expect(validSave(timer)).toBe(false);
});
