import { expect, it } from "vitest";
import { practiceGame } from "../engine/practice";
import { reducer, turnCheck } from "../engine/game";
import { validSave } from "./storage";
import { suggestedDestinations, turnGuidance } from "./guidance";
import { translator } from "../i18n/translate";
import messages from "../i18n/zh-CN";
function opened() {
  const s = practiceGame();
  s.players[0].melded = true;
  s.table = [{ id: "run", tiles: [0, 1, 2] }];
  s.players[0].rack = [3, 12];
  const used = new Set([0, 1, 2, 3, 12]),
    rest = Array.from({ length: 106 }, (_, i) => i).filter(
      (id) => !used.has(id),
    );
  s.players[1].rack = rest.splice(0, 14);
  s.pool = rest;
  s.turnStart = { table: structuredClone(s.table), rack: [3, 12] };
  return s;
}
it("explains unavailable End and uses Pass when the pool is empty", () => {
  const s = practiceGame();
  expect(turnGuidance(s, [], []).endHelp).toContain("draw a tile instead");
  s.players[1].rack.push(...s.pool.splice(0));
  expect(turnGuidance(s, [], []).endHelp).toContain("pass instead");
  expect(turnGuidance(s, [], []).endHelp).not.toContain("draw");
  expect(validSave(s)).toBe(true);
});
it("suggests an opening without mutating the game or Undo snapshots", () => {
  const s = practiceGame(),
    before = JSON.stringify(s);
  expect(suggestedDestinations(s, [9, 35, 61])).toEqual(["new"]);
  expect(JSON.stringify(s)).toBe(before);
  expect(validSave(s)).toBe(true);
});
it("explains a six-point opening and distinguishes Reset from a penalty", () => {
  const s = reducer(practiceGame(), {
    type: "move",
    ids: [0, 1, 2],
    target: "new",
  });
  expect(suggestedDestinations(practiceGame(), [0, 1, 2])).toEqual([]);
  const g = turnGuidance(s, [], []);
  expect(g.message).toContain("6 / 30");
  expect(g.endHelp).toContain("3 penalty");
});
it("highlights additions but rejects a split that leaves an invalid source", () => {
  const s = opened();
  expect(suggestedDestinations(s, [3])).toEqual(["run"]);
  expect(suggestedDestinations(s, [0])).toEqual([]);
  const played = reducer(s, { type: "move", ids: [3], target: "run" });
  expect(turnCheck(played).valid).toBe(true);
  expect(suggestedDestinations(played, [3])).toEqual([]);
  expect(turnGuidance(played, [], []).endHelp).toContain("Ready to end");
});
it("checks joker replacement and reuse before suggesting a destination", () => {
  const s = practiceGame("jokers");
  expect(suggestedDestinations(s, [104, 30, 56])).toEqual([]);
  const replaced = reducer(s, {
    type: "move",
    ids: [4],
    target: "practice-wild",
  });
  const before = JSON.stringify(replaced);
  expect(suggestedDestinations(replaced, [104, 30, 56])).toEqual(["new"]);
  expect(JSON.stringify(replaced)).toBe(before);
  expect(validSave(replaced)).toBe(true);
});
it("ignores unavailable tiles, bot turns and finished games", () => {
  const s = opened();
  expect(suggestedDestinations(s, [999])).toEqual([]);
  expect(suggestedDestinations(s, [])).toEqual([]);
  s.current = 1;
  expect(suggestedDestinations(s, s.players[1].rack)).toEqual([]);
  s.current = 0;
  s.phase = "over";
  expect(suggestedDestinations(s, [3])).toEqual([]);
});
it("translates all guidance states, including selection and empty-pool feedback", () => {
  const t = translator(messages),
    states = [
      practiceGame(),
      opened(),
      reducer(practiceGame(), { type: "move", ids: [0, 1, 2], target: "new" }),
      reducer(practiceGame(), { type: "move", ids: [12], target: "new" }),
    ];
  states.push(reducer(states[1], { type: "move", ids: [3], target: "run" }));
  const bot = practiceGame();
  bot.current = 1;
  states.push(bot);
  const empty = practiceGame();
  empty.players[1].rack.push(...empty.pool.splice(0));
  states.push(empty);
  for (const state of states)
    for (const ids of [[], [9], [9, 35, 61]]) {
      const g = turnGuidance(state, ids, suggestedDestinations(state, ids));
      expect(t(g.message), g.message).not.toMatch(/[a-z]/i);
      expect(t(g.compactMessage), g.compactMessage).not.toMatch(/[a-z]/i);
      expect(t(g.endHelp), g.endHelp).not.toMatch(/[a-z]/i);
    }
});

it("explains locked public tiles before opening without blocking the player's own draft", () => {
  const s = opened();
  s.players[0].melded = false;
  // The tens are still physical tiles: move them from their old holders.
  const opening = [9, 35, 61];
  for (const p of s.players) p.rack = p.rack.filter(id => !opening.includes(id));
  s.pool = s.pool.filter(id => !opening.includes(id));
  s.players[0].rack.push(...opening);
  s.turnStart.rack = [...s.players[0].rack];
  const ready = reducer(s, { type: "move", ids: opening, target: "new" });
  expect(turnCheck(ready).valid).toBe(true);
  const t = translator(messages);
  for (const state of [s, ready]) {
    const before = JSON.stringify(state);
    for (const ids of [[0], [0, 3]]) {
      const g = turnGuidance(state, ids, suggestedDestinations(state, ids));
      expect(g.message).toContain("Table tiles unlock after your opening.");
      expect(g.compactMessage).toContain("Clear selection");
      expect(t(g.message)).not.toMatch(/[a-z]/i);
      expect(t(g.compactMessage)).not.toMatch(/[a-z]/i);
    }
    expect(JSON.stringify(state)).toBe(before);
    expect(validSave(state)).toBe(true);
  }
  // Own rack tiles already placed in this draft may be rearranged before opening.
  expect(turnGuidance(ready, [9], []).message).not.toContain("Table tiles unlock");
  ready.players[0].melded = true;
  expect(turnGuidance(ready, [0], []).message).not.toContain("Table tiles unlock");
});
