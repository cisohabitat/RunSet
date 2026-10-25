import { it, expect } from "vitest";
import { explainMeld, planHint } from "./coaching";
import { practiceGame } from "./practice";
import { reducer, turnCheck } from "./game";
import { conserved } from "./test-helpers";
it("explains specific invalid tiles", () => {
  expect(explainMeld([6, 19, 32])).toMatch(/repeats red/);
  expect(explainMeld([3, 5, 6])).toMatch(/missing 5/);
  expect(explainMeld([3])).toMatch(/2 more/);
});
it("offers a legal opening without mutating or ending the turn", () => {
  const s = practiceGame(),
    before = structuredClone(s),
    hint = planHint(s);
  expect(hint.table).not.toBeNull();
  expect(s).toEqual(before);
  const after = reducer(s, { type: "applyPlan", table: hint.table! });
  expect(after.current).toBe(s.current);
  expect(after.turn).toBe(s.turn);
  expect(turnCheck(after).valid).toBe(true);
  expect(after.players[0].melded).toBe(false);
  conserved(after);
});
it("does not discard unfinished table edits", () => {
  const s = reducer(practiceGame(), { type: "move", ids: [12], target: "new" });
  const before = structuredClone(s);
  expect(planHint(s).table).toBeNull();
  expect(s).toEqual(before);
});
it("retains a below-30 partial opening when offering a completion", () => {
  const s = reducer(practiceGame(), {
    type: "move",
    ids: [0, 1, 2],
    target: "new",
  });
  const hint = planHint(s);
  expect(hint.table).not.toBeNull();
  const after = reducer(s, { type: "applyPlan", table: hint.table! });
  expect(after.table[0]).toEqual(s.table[0]);
  expect(turnCheck(after).valid).toBe(true);
  conserved(after);
});
it("ignores hidden racks when suggesting moves", () => {
  const s = practiceGame(),
    other = structuredClone(s);
  other.players[1].rack = [];
  expect(planHint(s).used).toEqual(planHint(other).used);
});
it("rejects an invalid hint without drawing or changing anything", () => {
  const s = practiceGame();
  expect(
    reducer(s, { type: "applyPlan", table: [{ id: "bad", tiles: [9, 9, 9] }] }),
  ).toEqual(s);
});

it("explains patterns and points without relying on opponent racks", () => {
  const hint = planHint(practiceGame());
  expect(hint.explanations?.length).toBeGreaterThan(1);
  expect(hint.explanations?.some((text) => text.includes("30-point"))).toBe(
    true,
  );
  expect(
    hint.explanations?.some(
      (text) => text.startsWith("Group:") || text.startsWith("Run:"),
    ),
  ).toBe(true);
});
