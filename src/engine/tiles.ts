export const colors = ["red", "blue", "orange", "black"] as const;
export type Color = (typeof colors)[number];
export interface Tile {
  id: number;
  color: Color | null;
  num: number;
  joker: boolean;
}
export const tiles: Tile[] = colors
  .flatMap<Tile>((color, c) =>
    Array.from({ length: 26 }, (_, i) => ({
      id: c * 26 + i,
      color,
      num: (i % 13) + 1,
      joker: false,
    })),
  )
  .concat(
    [104, 105].map((id) => ({
      id,
      color: null,
      num: 0,
      joker: true,
    })) as Tile[],
  );
export function random(seed: number) {
  let s = seed | 0;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function shuffle<T>(input: T[], rng: () => number): T[] {
  const out = [...input];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
export const rackTotal = (rack: number[]) =>
  rack.reduce((sum, id) => sum + (tiles[id].joker ? 30 : tiles[id].num), 0);
