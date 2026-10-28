import { expect, it } from "vitest";
import { reducer } from "./game";
import { fixture, conserved } from "./test-helpers";
import { validSave } from "../lib/storage";

it("hint placement has exactly one conserved Undo snapshot and survives validation", () => {
  const start = fixture([9, 35, 61, 0]);
  const placed = reducer(start, { type: "applyPlan", table: [{ id: "hint", tiles: [9, 35, 61] }] });
  expect(validSave(placed)).toBe(true);
  expect(placed.history).toHaveLength(1);
  const undone = reducer(placed, { type: "undo" });
  expect(undone.table).toEqual(start.table);
  expect(undone.players[start.current].rack).toEqual(start.players[start.current].rack);
  conserved(undone);
});

it("creating a meld after removing another never reuses a surviving meld ID", () => {
  let s = fixture([0, 1, 2, 3, 4, 5, 6, 7, 8], [], true);
  for (const ids of [[0, 1, 2], [3, 4, 5], [6, 7, 8]])
    s = reducer(s, { type: "move", ids, target: "new" });
  s = reducer(s, { type: "move", ids: [0, 1, 2], target: "rack" });
  s = reducer(s, { type: "move", ids: [6], target: "new" });
  expect(new Set(s.table.map(m => m.id)).size).toBe(s.table.length);
  expect(validSave(s)).toBe(true);
  conserved(s);
});

it("a timestamped action after the deadline expires once instead of submitting a late play", () => {
  const start = fixture([9, 35, 61, 0]);
  start.turnSeconds = 60;
  start.deadline = 1000;
  const placed = reducer(start, { type: "move", ids: [9, 35, 61], target: "new", at: 900 });
  const next = reducer(placed, { type: "endTurn", at: 1001 });
  expect(next.table).toEqual([]);
  expect(next.players[start.current].rack).toHaveLength(5);
  expect(next.notice).toMatch(/Time’s up/);
  expect(next.deadline).toBe(61001);
  conserved(next);
});

it("splits a joker run without retrieving a joker whose represented tile stays unchanged", async () => {
  const { turnCheck } = await import("./game");
  const start = fixture([6], [{ id: "run", tiles: [0, 1, 104, 3, 4, 5] }], true);
  const extended = reducer(start, { type: "move", ids: [3, 4, 5, 6], target: "new" });
  expect(turnCheck(extended).valid).toBe(true);
  conserved(extended);
});

it("keeps saves valid through seeded mixed editing, undo, draw and turn completion", async () => {
  const { newGame } = await import("./game");
  const { random } = await import("./tiles");
  for (let seed = 1; seed <= 25; seed++) {
    const rng = random(seed);
    let s = newGame("You", 3, "normal", seed);
    for (let step = 0; step < 100 && s.phase !== "over"; step++) {
      const available = [...s.players[s.current].rack, ...s.table.flatMap(m => m.tiles)];
      const roll = rng();
      if (roll < 0.6 && available.length) {
        const ids = available.filter(() => rng() < 0.2).slice(0, 5);
        const targets = ["new", "rack", ...s.table.map(m => m.id)];
        s = reducer(s, { type: "move", ids, target: targets[Math.floor(rng() * targets.length)] });
      } else {
        const actions = ["undo", "resetTurn", "draw", "endTurn"] as const;
        s = reducer(s, { type: actions[Math.floor(rng() * actions.length)] });
      }
      conserved(s);
      expect(validSave(s), `seed ${seed}, edit ${step}`).toBe(true);
    }
  }
});

it("rejects duplicate group identifiers in hint submissions", () => {
  const start = fixture([9, 35, 61, 0, 1, 2]);
  const next = reducer(start, { type: "applyPlan", table: [
    { id: "duplicate", tiles: [9, 35, 61] },
    { id: "duplicate", tiles: [0, 1, 2] },
  ] });
  expect(next).toEqual(start);
});

it("preserves timed saves through 8000 seeded edits and deadline-boundary actions", async () => {
  const { newGame } = await import("./game");
  const { random } = await import("./tiles");
  let actions = 0;
  for (let seed = 2001; seed <= 2100; seed++) {
    const rng = random(seed);
    let s = newGame("时钟", 1 + seed % 3, "normal", seed, { turnSeconds: 60, now: 1000 });
    for (let step = 0; step < 80 && s.phase === "playing"; step++) {
      const previous = s, before = JSON.stringify(s), deadline = s.deadline!;
      actions++;
      const at = deadline + (step % 11 === 0 ? 1 : -1);
      const available = [...s.players[s.current].rack, ...s.table.flatMap(m => m.tiles)];
      const targets = ["new", "rack", ...s.table.map(m => m.id)];
      const roll = rng();
      if (roll < 0.5) s = reducer(s, { type: "move", ids: available.filter(() => rng() < 0.12).slice(0, 6), target: targets[Math.floor(rng() * targets.length)], at });
      else if (roll < 0.65) s = reducer(s, { type: "sortRack", by: step % 2 ? "number" : "color", at });
      else {
        const actions = ["undo", "resetTurn", "draw", "endTurn"] as const;
        s = reducer(s, { type: actions[Math.floor(rng() * actions.length)], at });
      }
      conserved(s);
      expect(validSave(s), `seed ${seed}, step ${step}`).toBe(true);
      expect(s.history?.length ?? 0).toBeLessThanOrEqual(100);
      if (at > deadline) {
        expect(s.deadline).toBe(at + 60000);
        expect(s.history ?? []).toHaveLength(0);
      }
      expect(JSON.stringify(previous)).toBe(before);
    }
  }
  expect(actions).toBe(8000);
});
