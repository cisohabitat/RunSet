import { useEffect } from "react";
import type { GameState } from "../engine/game";
import { rememberRound } from "../lib/roundHistory";
import { observeTurns } from "../lib/recentTurns";
export function useRecentTurns(game: GameState, epoch: number, enabled = true) {
  useEffect(() => {
    if (enabled && observeTurns(game, epoch) && game.phase === "over")
      void rememberRound(game);
  }, [game, epoch, enabled]);
}
