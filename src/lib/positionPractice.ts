import {
  reducer,
  turnCheck,
  type Action,
  type GameState,
} from "../engine/game";
import { validSave } from "./storage";
/** Copy public tiles and the current human's opening/joker context only. */
export function positionPractice(source: GameState): GameState | null {
  if (
    !validSave(source) ||
    source.phase !== "playing" ||
    source.players[source.current].bot
  )
    return null;
  const player = source.players[source.current];
  const known = new Set([
    ...player.rack,
    ...source.table.flatMap((m) => m.tiles),
  ]);
  const copy: GameState = {
    version: 1,
    seed: source.seed,
    turn: source.turn,
    current: 0,
    phase: "playing",
    players: [
      {
        name: player.name,
        bot: null,
        melded: player.melded,
        rack: [...player.rack],
      },
      {
        name: "Unseen tiles",
        bot: "easy",
        melded: false,
        rack: Array.from({ length: 106 }, (_, id) => id).filter(
          (id) => !known.has(id),
        ),
      },
    ],
    table: structuredClone(source.table),
    turnStart: structuredClone(source.turnStart),
    pool: [],
    passes: 0,
    lastPlaced: [],
    log: [],
    history: [],
    notice: "",
    coach: false,
  };
  return validSave(copy) ? copy : null;
}
export function positionPracticeAction(game: GameState, action: Action) {
  if (game.phase !== "playing")
    return {
      game,
      complete: false,
      feedback: "Restart this practice copy to try another turn.",
    };
  if (action.type === "endTurn") {
    const check = turnCheck(game);
    if (!check.valid) return { game, complete: false, feedback: check.reason };
    const next = reducer(game, { type: "endTurn" });
    return {
      game: next,
      complete: next.turn > game.turn || next.phase === "over",
      feedback: "",
    };
  }
  if (!["move", "sortRack", "undo", "resetTurn"].includes(action.type))
    return {
      game,
      complete: false,
      feedback:
        "This copy does not draw unseen tiles or play opponents. Try a move or return to your game.",
    };
  // UI timestamps belong to the saved game, never to this untimed copy.
  const { at: _at, ...local } = action;
  return { game: reducer(game, local), complete: false, feedback: "" };
}
