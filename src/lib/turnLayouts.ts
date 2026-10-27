import type { GameState } from "../engine/game";
import { colors, random, shuffle } from "../engine/tiles";
export const turnLayoutCount = 4;
export function validTurnLayout(value: unknown): value is number {
  return (
    Number.isInteger(value) &&
    Number(value) >= 0 &&
    Number(value) < turnLayoutCount
  );
}
/** Rotate colour families bijectively, keeping numbers, copies and joker identities. */
export function turnLayoutId(id: number, layout: number): number {
  return id >= 104 ? id : ((Math.floor(id / 26) + layout) % 4) * 26 + (id % 26);
}
export function turnLayoutText(text: string, layout: number): string {
  return text.replace(
    /\b(red|blue|orange|black)\b/g,
    (color) =>
      colors[(colors.indexOf(color as (typeof colors)[number]) + layout) % 4],
  );
}
export function applyTurnLayout(game: GameState, layout: number): GameState {
  if (!validTurnLayout(layout)) throw new RangeError("Invalid practice layout");
  if (layout === 0) return game;
  const next = structuredClone(game),
    map = (ids: number[]) => ids.map((id) => turnLayoutId(id, layout));
  next.players.forEach((p) => (p.rack = map(p.rack)));
  next.pool = map(next.pool);
  next.table.forEach((m) => (m.tiles = map(m.tiles)));
  next.turnStart.table.forEach((m) => (m.tiles = map(m.tiles)));
  next.turnStart.rack = map(next.turnStart.rack);
  next.history?.forEach((h) => {
    h.table.forEach((m) => (m.tiles = map(m.tiles)));
    h.rack = map(h.rack);
  });
  next.lastPlaced = map(next.lastPlaced);
  next.players[0].rack = shuffle(next.players[0].rack, random(4700 + layout));
  next.turnStart.rack = [...next.players[0].rack];
  return next;
}
