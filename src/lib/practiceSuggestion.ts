import type { GameState } from "../engine/game";
import { exerciseKinds, type ExerciseKind } from "../engine/exercises";
import { tiles } from "../engine/tiles";
export function practiceSuggestion(
  game: GameState | null,
  completed: readonly ExerciseKind[],
): { kind: ExerciseKind; reason: string } | null {
  const human = game?.players.find((p) => !p.bot);
  if (game?.phase === "over" && human) {
    if (!human.melded)
      return {
        kind: "opening",
        reason:
          "Your saved round ended before you opened. Practise reaching 30 points from your own rack, without a timer.",
      };
    if (human.rack.some((id) => tiles[id].joker))
      return {
        kind: "joker",
        reason:
          "A joker remained in your saved final rack. Try replacing and reusing one in a short exercise.",
      };
  }
  const kind = exerciseKinds.find((kind) => !completed.includes(kind));
  return kind
    ? {
        kind,
        reason:
          "This exercise kind has not been completed on this device yet. Try it whenever you like.",
      }
    : null;
}
