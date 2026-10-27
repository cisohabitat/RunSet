import { it, expect } from "vitest";
import { fixture } from "../engine/test-helpers";
import { practiceSuggestion } from "./practiceSuggestion";
import { translator } from "../i18n/translate";
import messages from "../i18n/zh-CN";
it("prioritizes actual unopened and joker final racks without changing state", () => {
  const game = fixture([104, 12]);
  game.phase = "over";
  const before = JSON.stringify(game);
  expect(practiceSuggestion(game, [])?.kind).toBe("opening");
  expect(JSON.stringify(game)).toBe(before);
  game.players.find((p) => !p.bot)!.melded = true;
  expect(practiceSuggestion(game, [])?.kind).toBe("joker");
});
it("uses local completions for ongoing rounds and stops after all goals", () => {
  const game = fixture([104, 12]);
  expect(practiceSuggestion(game, ["opening"])?.kind).toBe("extend");
  expect(
    practiceSuggestion(null, ["opening", "extend", "repair", "joker"]),
  ).toBeNull();
});
it("translates each suggestion reason without an invented skill assessment", () => {
  const t = translator(messages),
    game = fixture([104, 12]);
  game.phase = "over";
  const first = practiceSuggestion(game, [])!;
  game.players.find((p) => !p.bot)!.melded = true;
  for (const idea of [
    first,
    practiceSuggestion(game, [])!,
    practiceSuggestion(null, [])!,
  ])
    expect(t(idea.reason)).not.toMatch(/[a-z]/i);
});
