import { tiles } from "../engine/tiles";
export type RackOrder = {
  seed: number;
  mode: "manual" | "color" | "number";
  ids: number[];
};
export const rackOrderKey = "runset.rackOrder.v1";
export function decodeRackOrder(raw: string | null): RackOrder | null {
  try {
    const value = JSON.parse(raw ?? "null");
    if (
      !value ||
      !Number.isFinite(value.seed) ||
      !["manual", "color", "number"].includes(value.mode) ||
      !Array.isArray(value.ids) ||
      value.ids.length > 106 ||
      new Set(value.ids).size !== value.ids.length ||
      value.ids.some(
        (id: unknown) =>
          !Number.isInteger(id) || Number(id) < 0 || Number(id) > 105,
      )
    )
      return null;
    return { seed: value.seed, mode: value.mode, ids: value.ids };
  } catch {
    return null;
  }
}
/** A display projection only: never alter physical game arrays or turn snapshots. */
export function orderedRack(
  rack: number[],
  order: RackOrder | null,
  seed: number,
): number[] {
  if (!order || order.seed !== seed) return rack;
  if (order.mode === "manual")
    return [
      ...order.ids.filter((id) => rack.includes(id)),
      ...rack.filter((id) => !order.ids.includes(id)),
    ];
  return [...rack].sort((a, b) =>
    order.mode === "number"
      ? tiles[a].num - tiles[b].num || a - b
      : (tiles[a].color ?? "z").localeCompare(tiles[b].color ?? "z") ||
        tiles[a].num - tiles[b].num ||
        a - b,
  );
}
