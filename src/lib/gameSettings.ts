import type { Difficulty, GameOptions, GameState } from "../engine/game";
export interface GameSettings {
  name: string;
  bots: number;
  difficulty: Difficulty;
  target: NonNullable<GameOptions["target"]>;
  turnSeconds: NonNullable<GameOptions["turnSeconds"]>;
  coach: boolean;
}
/** A fresh game keeps these options, never the old deal, deadline or scores. */
export function settingsForGame(game: GameState): GameSettings {
  return {
    name: game.players.find((player) => !player.bot)!.name,
    bots: game.players.length - 1,
    difficulty: game.players.find((player) => player.bot)?.bot ?? "normal",
    target: (game.match?.target ?? 0) as GameSettings["target"],
    turnSeconds: game.turnSeconds ?? 0,
    coach: game.coach === true,
  };
}
/** UI boundary for a newly dealt game only. Saved/imported names stay literal. */
export function nameFreshComputers(game: GameState, locale: string): GameState {
  if (locale !== "zh-CN") return game;
  let seat = 0;
  return {
    ...game,
    players: game.players.map((player) =>
      player.bot
        ? { ...player, name: ["电脑阿明", "电脑小兰", "电脑老陈"][seat++] }
        : player,
    ),
  };
}
