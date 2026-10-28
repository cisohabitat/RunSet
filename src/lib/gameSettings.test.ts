import { expect, it } from "vitest";
import { newGame, reducer } from "../engine/game";
import { nameFreshComputers, settingsForGame } from "./gameSettings";
it("names only fresh Chinese computers while preserving the human, deal and options", () => {
  const game = newGame("constructor", 3, "hard", 42, {
      target: 200,
      turnSeconds: 120,
      now: 100,
      coach: true,
    }),
    raw = JSON.stringify(game),
    named = nameFreshComputers(game, "zh-CN");
  expect(JSON.stringify(game)).toBe(raw);
  expect(named.players.filter((p) => p.bot).map((p) => p.name)).toEqual([
    "电脑阿明",
    "电脑小兰",
    "电脑老陈",
  ]);
  expect(named.players.find((p) => !p.bot)).toBe(
    game.players.find((p) => !p.bot),
  );
  expect({ ...named, players: game.players }).toEqual(game);
  named.players.forEach((p, i) =>
    expect({ ...p, name: game.players[i].name }).toEqual(game.players[i]),
  );
  expect(settingsForGame(named)).toEqual(settingsForGame(game));
  expect(nameFreshComputers(game, "en")).toBe(game);
});
it("keeps existing match participants literal when dealing the next round", () => {
  const game = nameFreshComputers(
    newGame("red 7", 1, "easy", 42, { target: 500 }),
    "zh-CN",
  );
  game.phase = "over";
  game.match!.rounds = [{ scores: [10, -10], winner: 0 }];
  game.match!.totals = [10, -10];
  const next = reducer(game, { type: "nextRound" });
  expect(next.players.map((p) => p.name)).toEqual(
    game.players.map((p) => p.name),
  );
  expect(next.match?.round).toBe(2);
});
