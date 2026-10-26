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
