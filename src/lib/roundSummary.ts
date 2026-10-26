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
        ? `${winner.name} played their last tile. The first empty rack ends the round.`
        : reason === "pool-exhausted"
          ? "The pool is empty and everyone passed in succession. The round has ended."
          : "This saved round is complete. Its exact ending was not recorded.",
    winnerExplanation:
      reason === "rack-empty"
        ? `${winner.name} wins with no tiles left.`
        : `${winner.name} wins with the lowest remaining tile total: ${winner.total}.`,
    tieBreak:
      reason !== "rack-empty" &&
      scores.filter((player) => player.total === winner.total).length > 1
        ? `The lowest total is tied at ${winner.total}. ${winner.name} wins because their seat comes first among the tied players.`
        : undefined,
  };
}
