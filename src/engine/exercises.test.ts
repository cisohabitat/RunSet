import { expect, it } from "vitest";
import { exerciseGame, exerciseComplete, exerciseKinds } from "./exercises";
import { reducer } from "./game";
import { conserved } from "./test-helpers";
import { validSave } from "../lib/storage";
it("creates conserved exercises with valid snapshots and no premature success", () => {
  for (const kind of exerciseKinds) {
    const s = exerciseGame(kind);
    conserved(s);
    expect(validSave(s)).toBe(true);
    expect(exerciseComplete(kind, s)).toBe(false);
  }
});
it("checks each real-engine solution and rejects a short opening and incomplete joker reuse", () => {
  let s = exerciseGame("opening");
  s = reducer(s, { type: "move", ids: [0, 1, 2], target: "new" });
  expect(exerciseComplete("opening", s)).toBe(false);
  s = reducer(s, { type: "resetTurn" });
  s = reducer(s, { type: "move", ids: [9, 35, 61], target: "new" });
  expect(exerciseComplete("opening", s)).toBe(true);
  conserved(s);
  s = reducer(exerciseGame("extend"), {
    type: "move",
    ids: [3],
    target: "exercise-run",
  });
  expect(exerciseComplete("extend", s)).toBe(true);
  conserved(s);
  s = exerciseGame("repair");
  s = reducer(s, { type: "move", ids: [1], target: s.table[0].id });
  expect(exerciseComplete("repair", s)).toBe(true);
  conserved(s);
  s = reducer(exerciseGame("joker"), {
    type: "move",
    ids: [4],
    target: "exercise-wild",
  });
  expect(exerciseComplete("joker", s)).toBe(false);
  s = reducer(s, { type: "move", ids: [104, 30, 56], target: "new" });
  expect(exerciseComplete("joker", s)).toBe(true);
  conserved(s);
});
it("allows rebuilding the gap exercise after a safe Reset", () => {
  let s = reducer(exerciseGame("repair"), { type: "resetTurn" });
  s = reducer(s, { type: "move", ids: [0, 1, 2], target: "new" });
  expect(exerciseComplete("repair", s)).toBe(true);
  conserved(s);
});

it("replays hundreds of seeded conserved puzzles with legal, achievable goals", async () => {
  const { exerciseClue, exerciseDescription } = await import("./exercises");
  const { turnCheck } = await import("./game");
  const { translator } = await import("../i18n/translate");
  const { default: messages } = await import("../i18n/zh-CN");
  const t = translator(messages);
  for (const code of [
    1,
    2,
    4321,
    999999,
    ...Array.from({ length: 96 }, (_, i) => 700 + i),
  ])
    for (const kind of exerciseKinds) {
      let s = exerciseGame(kind, code);
      expect(s).toEqual(exerciseGame(kind, code));
      conserved(s);
      expect(validSave(s)).toBe(true);
      expect(exerciseComplete(kind, s)).toBe(false);
      expect(t(exerciseDescription(kind, code).goal)).not.toMatch(/[A-Za-z]/);
      const target = kind === "opening" ? "new" : s.table[0].id;
      s = reducer(s, { type: "move", ids: exerciseClue(kind, s), target });
      if (kind === "joker") {
        expect(exerciseComplete(kind, s)).toBe(false);
        s = reducer(s, {
          type: "move",
          ids: exerciseClue(kind, s),
          target: "new",
        });
      }
      expect(exerciseComplete(kind, s), `${kind}:${code}`).toBe(true);
      expect(turnCheck(s).valid).toBe(true);
      conserved(s);
      expect(validSave(s)).toBe(true);
      s = reducer(s, { type: "endTurn" });
      conserved(s);
      expect(validSave(s)).toBe(true);
    }
});
it("varies visible puzzle values and colours while rejecting malformed numbers", () => {
  expect(exerciseGame("extend", 1).table).not.toEqual(
    exerciseGame("extend", 2).table,
  );
  for (const code of [0, -1, 1.5, 1000000, NaN, Infinity])
    expect(() => exerciseGame("opening", code)).toThrow();
});

it("accepts an extra legal extension when the stated goal is already met", async () => {
  const { exerciseClue } = await import("./exercises");
  const { tiles } = await import("./tiles");
  const code = Array.from({ length: 100 }, (_, i) => i + 1).find(
    (n) => tiles[exerciseGame("extend", n).table[0].tiles[0]].num === 9,
  )!;
  let s = exerciseGame("extend", code);
  s = reducer(s, {
    type: "move",
    ids: exerciseClue("extend", s),
    target: s.table[0].id,
  });
  const extra = s.players[0].rack.find((id) => tiles[id].num === 13)!;
  s = reducer(s, { type: "move", ids: [extra], target: s.table[0].id });
  expect(exerciseComplete("extend", s)).toBe(true);
  conserved(s);
});
