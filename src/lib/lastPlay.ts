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

/** Public completed destinations; never infer the sequence of rearrangements. */
export function lastPlayDestinations(s: GameState) {
  const result: { index: number; tiles: number[]; placed: number[] }[] = [];
  for (const step of lastPlay(s)) {
    let destination = result.find((item) => item.index === step.index);
    if (!destination) {
      destination = { index: step.index, tiles: step.tiles, placed: [] };
      result.push(destination);
    }
    destination.placed.push(step.id);
  }
  return result;
}
