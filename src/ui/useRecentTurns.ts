import { useEffect } from "react";
import type { GameState } from "../engine/game";
import { observeTurns } from "../lib/recentTurns";
export function useRecentTurns(game: GameState, epoch: number, enabled = true) {
  useEffect(() => {
    if (enabled) observeTurns(game, epoch);
  }, [game, epoch, enabled]);
}
