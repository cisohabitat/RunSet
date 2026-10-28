import type { Difficulty } from "../engine/game";
import type { RoundRecord } from "./roundHistory";
export type HistoryLevel = "all" | Difficulty;
/** Mixed-level rounds match once if any computer used the selected level. */
export function roundHistoryView(rounds: RoundRecord[], level: HistoryLevel) {
  const shown = rounds
    .filter((r) => level === "all" || r.players.some((p) => p.bot === level))
    .reverse();
  return {
    rounds: shown,
    wins: shown.filter((r) => r.players[r.winner].bot === null).length,
    total: rounds.length,
  };
}
