import { expect, it } from "vitest";
import { endgameCases, crowdedBorrow } from "../../scripts/endgame-fixtures";
import { endgameWitness } from "../../scripts/endgame-oracle";
import { validSave } from "../lib/storage";
import { planBot } from "./bot";
import { reducer, turnCheck } from "./game";
import { conserved } from "./test-helpers";

for (const fixture of endgameCases())
  it(`Hard respects the validated endgame objective: ${fixture.id}`, () => {
    const s = fixture.state,
      before = JSON.stringify(s);
    expect(validSave(s)).toBe(true);
    const table = planBot(s, 380),
      next = reducer(s, { type: "botTurn", table });
    if (fixture.finish) {
      const draft = reducer(s, { type: "applyPlan", table });
      expect(draft).not.toBe(s);
      expect(turnCheck(draft).valid).toBe(true);
      expect(next.players[s.current].rack).toEqual([]);
      expect(next.phase).toBe("over");
    } else {
      expect(table).toEqual(s.table);
      expect(next.players[s.current].rack).toEqual(s.players[s.current].rack);
      expect(next.passes).toBe(1);
    }
    conserved(next);
    expect(validSave(next)).toBe(true);
    expect(JSON.stringify(s)).toBe(before);
  });

it("the crowded finish has an independent literal transfer witness", () => {
  const s = crowdedBorrow(),
    table = endgameWitness(s);
  expect(table).not.toBeNull();
  const draft = reducer(s, { type: "applyPlan", table: table! });
  expect(turnCheck(draft).valid).toBe(true);
  expect(draft.players[s.current].rack).toEqual([]);
  conserved(draft);
});

it("local finishing preserves Easy/Normal and the zero-budget fallback", () => {
  for (const level of ["easy", "normal", "hard"] as const) {
    const s = crowdedBorrow();
    s.players[0].bot = level;
    expect(planBot(s, 0)).toEqual(s.table);
    if (level !== "hard") expect(planBot(s, 380)).toEqual(s.table);
  }
});

it("the crowded finish ignores unseen allocations and avoids existing meld IDs", () => {
  const s = crowdedBorrow();
  const extra = s.players[1].rack.splice(4);
  s.players.push({ name: "Hidden", bot: "normal", rack: extra, melded: true });
  // A saved earlier search is allowed to have used this ID already.
  s.table[1].id = "finish-1-0-0";
  s.turnStart.table = structuredClone(s.table);
  const hidden = structuredClone(s);
  [hidden.players[1].rack[0], hidden.players[2].rack[0]] = [
    hidden.players[2].rack[0],
    hidden.players[1].rack[0],
  ];
  const redacted = structuredClone(s);
  redacted.history = [];
  redacted.log = [];
  redacted.players.slice(1).forEach((p) => (p.rack = []));
  const expected = planBot(s, 380);
  expect(planBot(hidden, 380)).toEqual(expected);
  expect(planBot(redacted, 380)).toEqual(expected);
  expect(new Set(expected.map((m) => m.id)).size).toBe(expected.length);
  const finished = reducer(s, { type: "botTurn", table: expected });
  expect(finished.players[0].rack).toEqual([]);
  conserved(finished);
  expect(validSave(finished)).toBe(true);
});
