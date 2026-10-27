import type { GameState } from "../engine/game";
/** Review destinations, not an invented order of intermediate bot edits. */
export function lastPlay(s: GameState) {
  const table = s.phase === "over" ? s.table : s.turnStart.table;
  const ids = [...new Set(s.lastPlaced)];
  if (!ids.length || ids.some((id) => !table.some((m) => m.tiles.includes(id))))
    return [];
  return ids.map((id) => {
    const index = table.findIndex((m) => m.tiles.includes(id));
    return { id, index, tiles: [...table[index].tiles] };
  });
}
