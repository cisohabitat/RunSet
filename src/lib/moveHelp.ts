import { reducer, turnCheck, type GameState } from "../engine/game";
import { inspectMeld } from "../engine/meld";
import { explainMeld } from "../engine/coaching";
import { tiles } from "../engine/tiles";
export interface MoveHelpData {
  kind: "blocked" | "draft";
  reason: string;
  next: string;
  ids: number[];
  candidate?: number;
}
const blockedNext: Record<string, string> = {
  "Table tiles cannot return to your rack.":
    "Choose a group/run on the table as the destination.",
  "Open with 30 points before rearranging table tiles.":
    "Choose only tiles from your rack for your opening.",
  "Your opening meld must come entirely from your rack.":
    "Choose New group or run for your opening.",
};
const reset =
  "Use Reset to restore this turn, then build one group or run at a time.";
/** Explain observed engine state. Any suggested addition is checked by the reducer. */
export function moveHelp(
  game: GameState,
  attempt?: number[],
): MoveHelpData | null {
  const p = game.players[game.current];
  if (p.bot || game.phase !== "playing") return null;
  if (attempt?.length && Object.hasOwn(blockedNext, game.notice))
    return {
      kind: "blocked",
      reason: game.notice,
      next: blockedNext[game.notice],
      ids: [...attempt],
    };
  if (game.notice === "Play at least one rack tile, or draw to end your turn.")
    return {
      kind: "draft",
      reason: game.notice,
      next: game.pool.length
        ? "Choose Draw to restore unfinished edits, take one tile and end your turn."
        : "Choose Pass to restore unfinished edits and end your turn.",
      ids: [],
    };
  const check = turnCheck(game),
    dirty = JSON.stringify(game.table) !== JSON.stringify(game.turnStart.table);
  if (check.valid || (!dirty && !check.played.length)) return null;
  if (
    check.reason ===
    "Replace a joker with its represented rack tile, then reuse it this turn."
  )
    return {
      kind: "draft",
      reason: check.reason,
      next: "Use Reset to restore the joker, then replace it with the matching rack tile.",
      ids: game.turnStart.table
        .flatMap((m) => m.tiles)
        .filter((id) => tiles[id].joker),
    };
  const invalid = game.table.find((m) => !inspectMeld(m.tiles).valid);
  if (invalid) {
    const candidate = p.rack.find(
      (id) => inspectMeld([...invalid.tiles, id]).valid,
    );
    if (candidate !== undefined) {
      const base = { ...game, history: [] },
        trial = reducer(base, {
          type: "move",
          ids: [candidate],
          target: invalid.id,
        });
      const group = trial.table.find((m) => m.id === invalid.id);
      if (
        trial !== base &&
        group?.tiles.includes(candidate) &&
        inspectMeld(group.tiles).valid
      ) {
        const number = game.table.indexOf(invalid) + 1,
          tile = tiles[candidate];
        return {
          kind: "draft",
          reason: explainMeld(invalid.tiles),
          next: tile.joker
            ? `Add a joker from your rack to group/run ${number}.`
            : `Add ${tile.color} ${tile.num} from your rack to group/run ${number}.`,
          ids: [...invalid.tiles],
          candidate,
        };
      }
    }
    return {
      kind: "draft",
      reason: explainMeld(invalid.tiles),
      next: reset,
      ids: [...invalid.tiles],
    };
  }
  if (!p.melded && check.points < 30)
    return {
      kind: "draft",
      reason: check.reason,
      next: `Add at least ${30 - check.points} more opening points using tiles from your rack.`,
      ids: [...check.played],
    };
  return {
    kind: "draft",
    reason: check.reason,
    next: reset,
    ids: [...check.played],
  };
}
