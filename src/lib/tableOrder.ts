import { inspectMeld, type Meld } from "../engine/meld";
import { colors, tiles } from "../engine/tiles";
export const tableOrderKey = "runset.tableOrder.v1";
export const tableOrders = ["placed", "kind", "colour"] as const;
export type TableOrder = (typeof tableOrders)[number];
export function isTableOrder(raw: unknown): raw is TableOrder {
  return (
    typeof raw === "string" && (tableOrders as readonly string[]).includes(raw)
  );
}
export function readTableOrder(): TableOrder {
  try {
    const raw = localStorage.getItem(tableOrderKey);
    return isTableOrder(raw) ? raw : "placed";
  } catch {
    return "placed";
  }
}
/** A display projection: original IDs, references, tile order and engine state stay intact. */
export function orderedTable(table: Meld[], order: TableOrder): Meld[] {
  if (order === "placed") return [...table];
  return table
    .map((meld, index) => {
      const info = inspectMeld(meld.tiles);
      const natural = info.ordered.find((id) => !tiles[id].joker);
      return {
        meld,
        index,
        valid: info.valid,
        kind: info.kind === "group" ? 0 : 1,
        colour:
          info.kind === "group"
            ? 4
            : natural === undefined
              ? 5
              : colors.indexOf(tiles[natural].color!),
        number: info.valid ? Math.min(...Object.values(info.values)) : 0,
      };
    })
    .sort((a, b) => {
      if (a.valid !== b.valid) return a.valid ? 1 : -1;
      if (!a.valid) return a.index - b.index;
      return (
        (order === "kind"
          ? a.kind - b.kind || (a.kind ? a.colour - b.colour : 0)
          : a.colour - b.colour) ||
        a.number - b.number ||
        a.index - b.index
      );
    })
    .map((item) => item.meld);
}
