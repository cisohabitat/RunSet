import { tiles } from "../engine/tiles";
import { results, type GameState } from "../engine/game";
/** Infer only documented end conditions; do not invent a cause for older saves. */
export function roundSummary(game: GameState) {
  const scores = results(game),
    winner = scores.find((player) => player.winner)!;
  const reason = game.players.some((player) => player.rack.length === 0)
    ? "rack-empty"
    : game.pool.length === 0 && game.passes >= game.players.length
      ? "pool-exhausted"
      : "unknown";
  return {
    reason,
    message:
      reason === "rack-empty"
        ? "The round ended because a rack is empty."
        : reason === "pool-exhausted"
          ? "The pool is empty and everyone passed in succession. The round has ended."
          : "This saved round is complete. Its exact ending was not recorded.",
    winnerExplanation:
      reason === "rack-empty"
        ? `Winner: ${winner.name}. No tiles remain in this rack.`
        : `Winner: ${winner.name}. Lowest remaining tile total: ${winner.total}.`,
    tieBreak:
      reason !== "rack-empty" &&
      scores.filter((player) => player.total === winner.total).length > 1
        ? `The lowest total is tied at ${winner.total}. The player seated first among those tied wins: ${winner.name}.`
        : undefined,
  };
}

/** A takeaway may use final rack facts, never guessed missed opportunities. */
export function learningTakeaway(game: GameState) {
  const human = game.players.find((player) => !player.bot)!;
  if (!human.rack.length)
    return {
      ids: [] as number[],
      message:
        "You emptied your rack. Playing the last tile ends the round as soon as the turn is completed legally.",
    };
  const joker = human.rack.find((id) => tiles[id].joker);
  if (joker !== undefined)
    return {
      ids: [joker],
      message:
        "A joker remains in your rack. It counts as 30 points at the end. In your next game, look for a legal group or run where it can help.",
    };
  if (!human.melded)
    return {
      ids: [] as number[],
      message:
        "Your opening is still ahead of you. Practise making 30 points from your own rack; you can combine more than one group or run.",
    };
  const highest = [...human.rack].sort(
    (a, b) => tiles[b].num - tiles[a].num,
  )[0];
  return {
    ids: [highest],
    message: `Your highest remaining number tile is ${tiles[highest].num}. Each number counts as its face value. Try a quick exercise to practise finding a place for your tiles.`,
  };
}
