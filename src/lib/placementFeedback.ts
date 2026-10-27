import type { GameState } from "../engine/game";
export interface PlacementFeedback {
  count: number;
  group: string | null;
  index: number;
}
/** Describe observed physical relocation, never an optimistic action request. */
export function placementFeedback(
  before: GameState,
  after: GameState,
  selection: number[],
  target: string,
): PlacementFeedback | null {
  if (
    before.seed !== after.seed ||
    before.turn !== after.turn ||
    before.current !== after.current ||
    after.phase !== "playing" ||
    after.players[after.current].bot
  )
    return null;
  const ids = [...new Set(selection)];
  if (
    !ids.length ||
    ids.some(
      (id) =>
        !before.players[before.current].rack.includes(id) &&
        !before.table.some((m) => m.tiles.includes(id)),
    )
  )
    return null;
  const destination =
    target === "rack"
      ? null
      : after.table.find((m) =>
          target === "new"
            ? !before.table.some((old) => old.id === m.id) &&
              ids.every((id) => m.tiles.includes(id))
            : m.id === target,
        );
  if (target !== "rack" && !destination) return null;
  const location = (game: GameState, id: number) =>
    game.players[game.current].rack.includes(id)
      ? "rack"
      : `meld:${game.table.find((m) => m.tiles.includes(id))?.id}`;
  const landed =
    target === "rack" ? after.players[after.current].rack : destination!.tiles;
  if (ids.some((id) => !landed.includes(id))) return null;
  const count = ids.filter(
    (id) => location(before, id) !== location(after, id),
  ).length;
  return count
    ? {
        count,
        group: destination?.id ?? null,
        index: destination ? after.table.indexOf(destination) : -1,
      }
    : null;
}
