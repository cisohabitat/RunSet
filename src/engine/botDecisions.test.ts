import { expect, it } from "vitest";
import { fixture, conserved } from "./test-helpers";
import { planBot } from "./bot";
import { reducer, turnCheck } from "./game";
it("Normal and Hard use a qualifying five-tile opening instead of a higher-point three-tile group", () => {
  const rack = [3, 4, 6, 7, 38, 64, 104];
  for (const level of ["easy", "normal", "hard"] as const) {
    const s = fixture(rack);
    s.players[s.current].bot = level;
    const before = JSON.stringify(s),
      table = planBot(s),
      draft = reducer(s, { type: "applyPlan", table });
    expect(turnCheck(draft).valid).toBe(true);
    expect(turnCheck(draft).played).toHaveLength(level === "easy" ? 3 : 5);
    expect(turnCheck(draft).points).toBe(level === "easy" ? 39 : 30);
    expect(JSON.stringify(s)).toBe(before);
    conserved(draft);
  }
});
it("Normal keeps a run extension available instead of filling a competing group and missing a rack-empty finish", () => {
  for (const reverse of [false, true]) {
    const table = [
      { id: "fours", tiles: [29, 55, 81] },
      { id: "run", tiles: [0, 1, 2] },
    ];
    const s = fixture([3, 4], reverse ? [...table].reverse() : table, true);
    s.players[s.current].bot = "normal";
    const before = JSON.stringify(s),
      plan = planBot(s),
      draft = reducer(s, { type: "applyPlan", table: plan });
    expect(turnCheck(draft).valid).toBe(true);
    expect(draft.players[s.current].rack).toEqual([]);
    expect(plan.find((m) => m.id === "fours")!.tiles).toEqual([29, 55, 81]);
    expect(plan.find((m) => m.id === "run")!.tiles).toEqual([0, 1, 2, 3, 4]);
    expect(JSON.stringify(s)).toBe(before);
    conserved(draft);
  }
});

it("Normal and Hard retain the 30-point threshold and legal zero-budget fallback", () => {
  for (const level of ["normal", "hard"] as const) {
    const s = fixture([0, 1, 2]);
    s.players[s.current].bot = level;
    expect(planBot(s)).toEqual(s.table);
    const opened = fixture([3, 4], [{ id: "run", tiles: [0, 1, 2] }], true);
    opened.players[opened.current].bot = level;
    expect(planBot(opened, 0)).toEqual(opened.table);
    conserved(opened);
  }
});
it("the winning extension decision is independent of unseen rack and pool allocations", () => {
  const s = fixture(
    [3, 4],
    [
      { id: "fours", tiles: [29, 55, 81] },
      { id: "run", tiles: [0, 1, 2] },
    ],
    true,
  );
  s.players[s.current].bot = "normal";
  const hidden = structuredClone(s),
    other = 1 - s.current;
  const a = hidden.pool.pop()!,
    b = hidden.players[other].rack.pop()!;
  hidden.pool.push(b);
  hidden.players[other].rack.push(a);
  const before = JSON.stringify(hidden);
  expect(planBot(hidden)).toEqual(planBot(s));
  expect(JSON.stringify(hidden)).toBe(before);
  conserved(hidden);
});
