import { describe, it, expect } from "vitest";
import { newGame, reducer, turnCheck, results, type GameState } from "./game";
import { inspectMeld } from "./meld";
import { fixture, conserved } from "./test-helpers";
const move = (s: GameState, ids: number[], target = "new") =>
  reducer(s, { type: "move", ids, target });
describe("turn rules", () => {
  it("deals fourteen to 2–4 players with seeded seat order", () => {
    for (const n of [1, 2, 3]) {
      const s = newGame("You", n, "easy", 99);
      expect(s.players).toHaveLength(n + 1);
      for (const p of s.players) expect(p.rack).toHaveLength(14);
      conserved(s);
      expect(s).toEqual(newGame("You", n, "easy", 99));
    }
  });
  it("opens with 30 points and conserves all tiles", () => {
    let s = fixture([9, 35, 61, 0]);
    s = move(s, [9, 35, 61]);
    expect(turnCheck(s).points).toBe(30);
    const next = reducer(s, { type: "endTurn" });
    expect(next.players[s.current].melded).toBe(true);
    expect(next.players[s.current].rack).toEqual([0]);
    conserved(next);
  });
  it("rolls back an under-30 opening and draws exactly three penalty tiles", () => {
    const initial = fixture([0, 26, 52, 9]);
    const s = reducer(move(initial, [0, 26, 52]), { type: "endTurn" });
    expect(s.table).toEqual([]);
    expect(s.players[initial.current].rack.slice(0, 4)).toEqual(
      initial.turnStart.rack,
    );
    expect(s.players[initial.current].rack).toHaveLength(7);
    conserved(s);
  });
  it("prevents touching table melds or extending them before opening", () => {
    const s = fixture([3, 5, 6], [{ id: "existing", tiles: [0, 1, 2] }]);
    expect(move(s, [0]).table).toEqual(s.table);
    expect(move(s, [3], "existing").table).toEqual(s.table);
  });
  it("never lets original table tiles return to a rack", () => {
    const s = fixture([3], [{ id: "existing", tiles: [0, 1, 2] }], true);
    expect(move(s, [0], "rack").table).toEqual(s.table);
    conserved(s);
  });
  it("returns newly placed tiles and resets freely", () => {
    const s = fixture([9, 35, 61, 1]);
    const played = move(s, [9, 35, 61]);
    expect(move(played, [9], "rack").players[s.current].rack).toContain(9);
    const reset = reducer(played, { type: "resetTurn" });
    expect(reset.table).toEqual(s.table);
    expect(reset.players[s.current].rack).toEqual(s.turnStart.rack);
    conserved(reset);
  });
  it("drawing restores unfinished moves and ends the turn", () => {
    const s = fixture([9, 35, 61, 1]);
    const drawn = reducer(move(s, [9, 35, 61]), { type: "draw" });
    expect(drawn.table).toEqual([]);
    expect(drawn.players[s.current].rack).toHaveLength(5);
    expect(drawn.current).not.toBe(s.current);
    conserved(drawn);
  });
  it("refuses a valid empty turn", () => {
    const s = fixture([9, 35, 61]);
    const next = reducer(s, { type: "endTurn" });
    expect(next.current).toBe(s.current);
    expect(next.notice).toMatch(/at least one/);
  });
  it("allows splitting a run after opening", () => {
    let s = fixture([5, 6], [{ id: "run", tiles: [0, 1, 2, 3, 4] }], true);
    s = move(s, [3, 4, 5, 6]);
    expect(turnCheck(s).valid).toBe(true);
    expect(s.table.every((m) => inspectMeld(m.tiles).valid)).toBe(true);
    conserved(s);
  });
  it("enforces joker replacement and immediate reuse", () => {
    let s = fixture(
      [4, 30, 56, 82],
      [{ id: "wild", tiles: [3, 104, 5] }],
      true,
    );
    const invalid = move(s, [104, 30, 56]);
    expect(turnCheck(invalid).valid).toBe(false);
    s = move(s, [4], "wild");
    s = move(s, [104, 30, 56]);
    expect(turnCheck(s).valid).toBe(true);
    conserved(s);
  });
  it("ends when a rack is emptied and calculates zero-sum scores", () => {
    const s = fixture([9, 35, 61]);
    const ended = reducer(move(s, [9, 35, 61]), { type: "endTurn" });
    expect(ended.phase).toBe("over");
    expect(results(ended).find((p) => p.winner)?.bot).toBeNull();
    expect(results(ended).reduce((n, p) => n + p.score, 0)).toBe(0);
  });
  it("passes when empty and ends after everyone passes", () => {
    let s = fixture([1]);
    s.players[1 - s.current].rack.push(...s.pool.splice(0));
    s = reducer(s, { type: "draw" });
    expect(s.passes).toBe(1);
    s = reducer(s, { type: "draw" });
    expect(s.phase).toBe("over");
    conserved(s);
  });
  it("rejects bot submissions with duplicated or missing table tiles", () => {
    const s = fixture([3], [{ id: "run", tiles: [0, 1, 2] }], true);
    for (const table of [[{ id: "bad", tiles: [0, 0, 1] }], []]) {
      const next = reducer(s, { type: "botTurn", table });
      conserved(next);
      expect(next.table).toEqual(s.table);
    }
  });
});

it("reuses a replaced joker in the same run", () => {
  let s = fixture([4, 30], [{ id: "wild", tiles: [3, 104, 5] }], true);
  s = reducer(s, { type: "move", ids: [4], target: "wild" });
  expect(turnCheck(s).valid).toBe(true);
  expect(inspectMeld(s.table[0].tiles).values[104]).toBe(7);
  conserved(s);
});
