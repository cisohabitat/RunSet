import { expect, it, vi } from "vitest";
import {
  orderedTable,
  isTableOrder,
  readTableOrder,
  tableOrderKey,
} from "./tableOrder";
const sample = () => [
  { id: "blue-run", tiles: [26, 27, 28] },
  { id: "tens", tiles: [9, 35, 61] },
  { id: "red-run", tiles: [0, 1, 2] },
  { id: "draft", tiles: [3, 4] },
  { id: "elevens", tiles: [10, 36, 62] },
];
it("organises public melds while preserving original IDs, references and all tile order", () => {
  const table = sample(),
    before = JSON.stringify(table);
  Object.freeze(table);
  expect(orderedTable(table, "placed").map((m) => m.id)).toEqual(
    table.map((m) => m.id),
  );
  expect(orderedTable(table, "kind").map((m) => m.id)).toEqual([
    "draft",
    "tens",
    "elevens",
    "red-run",
    "blue-run",
  ]);
  expect(orderedTable(table, "colour").map((m) => m.id)).toEqual([
    "draft",
    "red-run",
    "blue-run",
    "tens",
    "elevens",
  ]);
  for (const mode of ["placed", "kind", "colour"] as const) {
    const view = orderedTable(table, mode);
    expect(view).not.toBe(table);
    for (const m of view) expect(table).toContain(m);
  }
  expect(JSON.stringify(table)).toBe(before);
});
it("keeps invalid and empty drafts first without inventing values, with stable ties", () => {
  const table = [
    { id: "empty", tiles: [] },
    { id: "duplicate", tiles: [0, 13, 26] },
    ...sample(),
  ];
  for (const mode of ["kind", "colour"] as const)
    expect(
      orderedTable(table, mode)
        .slice(0, 3)
        .map((m) => m.id),
    ).toEqual(["empty", "duplicate", "draft"]);
  const tied = [
    { id: "a", tiles: [0, 1, 2] },
    { id: "b", tiles: [13, 14, 15] },
  ];
  expect(orderedTable(tied, "colour").map((m) => m.id)).toEqual(["a", "b"]);
});
it("uses a joker run's actual colour without changing represented physical tiles", () => {
  const table = [
      { id: "blue", tiles: [26, 104, 28] },
      { id: "red", tiles: [0, 105, 2] },
    ],
    before = JSON.stringify(table);
  expect(orderedTable(table, "colour").map((m) => m.id)).toEqual([
    "red",
    "blue",
  ]);
  expect(JSON.stringify(table)).toBe(before);
});
it("validates the bounded preference and reads denied or malformed storage safely", () => {
  expect(isTableOrder("placed")).toBe(true);
  expect(isTableOrder("kind")).toBe(true);
  expect(isTableOrder("colour")).toBe(true);
  for (const raw of [null, {}, "manual", "kind ", "constructor"])
    expect(isTableOrder(raw)).toBe(false);
  try {
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => (key === tableOrderKey ? "kind" : null),
    });
    expect(readTableOrder()).toBe("kind");
    vi.stubGlobal("localStorage", { getItem: () => "broken" });
    expect(readTableOrder()).toBe("placed");
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw Error("denied");
      },
    });
    expect(readTableOrder()).toBe("placed");
  } finally {
    vi.unstubAllGlobals();
  }
});
