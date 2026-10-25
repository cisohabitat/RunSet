import { tiles, colors, type Color } from "./tiles";
export interface Meld {
  id: string;
  tiles: number[];
}
export interface MeldResult {
  valid: boolean;
  kind: "group" | "run" | null;
  points: number;
  ordered: number[];
  values: Record<number, number>;
  jokerColors: Partial<Record<number, Color>>;
}
export function inspectMeld(ids: number[]): MeldResult {
  const bad: MeldResult = {
    valid: false,
    kind: null,
    points: 0,
    ordered: [...ids].sort(
      (a, b) => (tiles[a]?.num ?? 0) - (tiles[b]?.num ?? 0),
    ),
    values: {},
    jokerColors: {},
  };
  if (
    ids.length < 3 ||
    ids.length > 13 ||
    new Set(ids).size !== ids.length ||
    ids.some((id) => !tiles[id])
  )
    return bad;
  const naturals = ids.filter((id) => !tiles[id].joker),
    jokers = ids.filter((id) => tiles[id].joker);
  if (!naturals.length) return bad;
  if (
    ids.length <= 4 &&
    naturals.every((id) => tiles[id].num === tiles[naturals[0]].num) &&
    new Set(naturals.map((id) => tiles[id].color)).size === naturals.length
  ) {
    const n = tiles[naturals[0]].num,
      missing = colors.filter(
        (c) => !naturals.some((id) => tiles[id].color === c),
      );
    return {
      valid: true,
      kind: "group",
      points: n * ids.length,
      ordered: [...naturals, ...jokers],
      values: Object.fromEntries(ids.map((id) => [id, n])),
      jokerColors: Object.fromEntries(jokers.map((id, i) => [id, missing[i]])),
    };
  }
  const sorted = [...naturals].sort(
    (a, b) => (tiles[a]?.num ?? 0) - (tiles[b]?.num ?? 0),
  );
  if (
    !sorted.every((id) => tiles[id].color === tiles[sorted[0]].color) ||
    new Set(sorted.map((id) => tiles[id].num)).size !== sorted.length
  )
    return bad;
  const low = tiles[sorted[0]].num,
    high = tiles[sorted.at(-1)!].num;
  if (high - low + 1 > ids.length) return bad;
  const start = Math.min(low, 14 - ids.length);
  if (start < 1 || high >= start + ids.length) return bad;
  const spare = [...jokers],
    ordered: number[] = [],
    values: Record<number, number> = {},
    jokerColors: Partial<Record<number, Color>> = {};
  for (let n = start; n < start + ids.length; n++) {
    const id = sorted.find((id) => tiles[id].num === n) ?? spare.shift();
    if (id === undefined) return bad;
    ordered.push(id);
    values[id] = n;
    if (tiles[id].joker) jokerColors[id] = tiles[sorted[0]].color!;
  }
  return {
    valid: true,
    kind: "run",
    points: Object.values(values).reduce((a, b) => a + b, 0),
    ordered,
    values,
    jokerColors,
  };
}
