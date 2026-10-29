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

it("rejects impossible historical scores even when aggregate totals agree", () => {
  for (const scores of [
    [10, 0],
    [10.5, -10.5],
    [789, -789],
    [-10, 10],
  ]) {
    const s = reducer(wonRound(), { type: "nextRound", at: 0 });
    s.match!.rounds = [{ scores, winner: 0 }];
    s.match!.totals = [...scores];
    expect(validSave(s), JSON.stringify(scores)).toBe(false);
  }
});
it("rejects completed-match history that disagrees with the actual final racks", () => {
  const s = wonRound();
  s.match!.rounds = [{ scores: [1, -1], winner: 0 }];
  s.match!.totals = [1, -1];
  expect(validSave(s)).toBe(false);
});

it("rejects a playing round after a unique match winner has already reached the target", () => {
  const s = reducer(wonRound(), { type: "nextRound" });
  s.match!.rounds = [{ scores: [600, -600], winner: 0 }];
  s.match!.totals = [600, -600];
  expect(validSave(s)).toBe(false);
});

function tiedMatch(): GameState {
  const s = newGame("Literal", 3, "easy", 91001, { target: 100 });
  const racks = [
    [104, 12, 6],
    [105, 38, 32],
    [25, 51, 77, 10],
  ];
  s.players.forEach((p, i) => {
    p.rack = i === 1 ? [] : racks.shift()!;
  });
  s.current = 1;
  s.phase = "over";
  s.table = [{ id: "finish", tiles: [9, 35, 61] }];
  s.turnStart = { table: [], rack: [9, 35, 61] };
  const used = new Set([
    ...s.table.flatMap((m) => m.tiles),
    ...s.players.flatMap((p) => p.rack),
  ]);
  s.pool = Array.from({ length: 106 }, (_, id) => id).filter(
    (id) => !used.has(id),
  );
  s.match = {
    target: 100,
    round: 2,
    rounds: [
      { scores: [150, -50, -50, -50], winner: 0 },
      { scores: [-50, 150, -50, -50], winner: 1 },
    ],
    totals: [100, 100, -100, -100],
  };
  return s;
}
it("continues a tied four-player target and rotates the starter without changing seats", () => {
  const s = tiedMatch(),
    names = s.players.map((p) => p.name);
  expect(validSave(s)).toBe(true);
  expect(matchWinner(s)).toBeNull();
  s.turnSeconds = 60;
  s.deadline = 60000;
  s.history = [];
  const next = reducer(s, { type: "nextRound", at: 90000 });
  expect(next.current).toBe(2);
  expect(next.match!.round).toBe(3);
  expect(next.match!.totals).toEqual([100, 100, -100, -100]);
  expect(next.players.map((p) => p.name)).toEqual(names);
  expect(next.players.every((p) => p.rack.length === 14 && !p.melded)).toBe(
    true,
  );
  expect(next.pool).toHaveLength(50);
  expect(next.table).toEqual([]);
  expect(next.history).toEqual([]);
  expect(next.deadline).toBe(150000);
  expect(validSave(next)).toBe(true);
  conserved(next);
});
