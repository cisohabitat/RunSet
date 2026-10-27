import type { GameState } from "../engine/game";
export type Landing = { id: number; location: string };
export function tileLocation(game: GameState, id: number): string | undefined {
  if (game.players.find((p) => !p.bot)?.rack.includes(id)) return "rack";
  const group = game.table.find((m) => m.tiles.includes(id));
  return group ? `meld:${group.id}` : undefined;
}
/** Require the reducer's new Undo snapshot as evidence of an accepted edit. */
export function latestEdit(before: GameState, after: GameState): Landing[] {
  if (
    before === after ||
    before.seed !== after.seed ||
    before.turn !== after.turn ||
    before.current !== after.current ||
    after.players[after.current].bot ||
    (after.history?.length ?? 0) < (before.history?.length ?? 0)
  )
    return [];
  const snapshot = after.history?.at(-1);
  if (
    !snapshot ||
    JSON.stringify(snapshot.table) !== JSON.stringify(before.table) ||
    JSON.stringify(snapshot.rack) !==
      JSON.stringify(before.players[before.current].rack)
  )
    return [];
  const ids = [
    ...after.players[after.current].rack,
    ...after.table.flatMap((m) => m.tiles),
  ];
  return ids
    .filter((id) => tileLocation(before, id) !== tileLocation(after, id))
    .map((id) => ({ id, location: tileLocation(after, id)! }));
}
