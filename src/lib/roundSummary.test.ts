import { expect, it } from "vitest";
import { newGame, reducer, results } from "../engine/game";
import { fixture } from "../engine/test-helpers";
import { roundSummary } from "./roundSummary";
import { settingsForGame } from "./gameSettings";
import { translator } from "../i18n/translate";
import messages from "../i18n/zh-CN";
it("explains an actual rack-empty finish without changing scores or saved state", () => {
  let s = fixture([9, 35, 61]);
  s = reducer(s, { type: "move", ids: [9, 35, 61], target: "new" });
  s = reducer(s, { type: "endTurn" });
  const before = JSON.stringify(s);
  const summary = roundSummary(s);
  expect(summary.reason).toBe("rack-empty");
  expect(summary.message).toContain("played their last tile");
  expect(summary.tieBreak).toBeUndefined();
  expect(JSON.stringify(s)).toBe(before);
  expect(results(s).reduce((n, p) => n + p.score, 0)).toBe(0);
});
it("explains empty-pool passes and an actual lowest-total tie by seat order", () => {
  let s = newGame("阿明", 2, "normal", 17);
  s.current = 0;
  s.pool = [];
  s.table = [];
  s.players[0].rack = [0];
  s.players[1].rack = [26];
  s.players[2].rack = Array.from({ length: 106 }, (_, i) => i).filter(
    (id) => id !== 0 && id !== 26,
  );
  s.turnStart = { table: [], rack: [0] };
  for (let i = 0; i < 3; i++) s = reducer(s, { type: "draw" });
  expect(s.phase).toBe("over");
  const summary = roundSummary(s);
  expect(summary.reason).toBe("pool-exhausted");
  expect(summary.tieBreak).toContain(s.players[0].name);
  expect(summary.tieBreak).toContain("seat comes first");
  expect(results(s)[0].winner).toBe(true);
});
it("does not claim a tie when the lowest remaining total is unique", () => {
  const s = fixture([0]);
  s.players[1].rack.push(...s.pool.splice(0));
  s.passes = s.players.length;
  s.phase = "over";
  const summary = roundSummary(s);
  expect(summary.reason).toBe("pool-exhausted");
  expect(summary.tieBreak).toBeUndefined();
  expect(summary.winnerExplanation).toContain("total: 1");
});
it("does not invent an ending for a completed save without end-condition evidence", () => {
  const s = newGame("阿明", 1, "easy", 7);
  s.phase = "over";
  expect(roundSummary(s).reason).toBe("unknown");
  expect(roundSummary(s).message).toContain("exact ending was not recorded");
});
it("translates ending explanations and preserves names that resemble interface labels", () => {
  const t = translator(messages),
    s = fixture([0]);
  for (const message of [
    "阿明 played their last tile. The first empty rack ends the round.",
    "阿明 wins with no tiles left.",
    "This saved round is complete. Its exact ending was not recorded.",
    "Remaining tiles deduct 41 points from this round.",
  ])
    expect(t(message)).not.toMatch(/[A-Za-z]/);
  s.players[s.current].name = "Pass";
  s.players[1 - s.current].rack.push(...s.pool.splice(0));
  s.passes = 2;
  s.phase = "over";
  let summary = roundSummary(s);
  expect(t(summary.winnerExplanation)).toContain("Pass");
  s.players[s.current].name = "阿明";
  summary = roundSummary(s);
  expect(t(summary.message)).not.toMatch(/[A-Za-z]/);
  expect(t(summary.winnerExplanation)).not.toMatch(/[A-Za-z]/);
  expect(
    t(
      "The lowest total is tied at 1. 阿明 wins because their seat comes first among the tied players.",
    ),
  ).not.toMatch(/[A-Za-z]/);
});
it("extracts a timed match's replay settings without copying scores, deal or deadlines", () => {
  const s = newGame("阿明", 3, "hard", 11, {
    target: 500,
    turnSeconds: 120,
    coach: true,
    now: 2000,
  });
  const before = JSON.stringify(s);
  expect(settingsForGame(s)).toEqual({
    name: "阿明",
    bots: 3,
    difficulty: "hard",
    target: 500,
    turnSeconds: 120,
    coach: true,
  });
  expect(JSON.stringify(s)).toBe(before);
});
it("preserves absent coaching and untimed single-round options as disabled", () => {
  const s = newGame("阿明", 1, "easy", 99);
  expect(settingsForGame(s)).toEqual({
    name: "阿明",
    bots: 1,
    difficulty: "easy",
    target: 0,
    turnSeconds: 0,
    coach: false,
  });
});
