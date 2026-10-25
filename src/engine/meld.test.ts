import { describe, it, expect } from "vitest";
import { inspectMeld } from "./meld";
import { tiles, random, shuffle } from "./tiles";
describe("tiles", () => {
  it("has exactly 106 unique tiles, two copies of every value, and two jokers", () => {
    expect(new Set(tiles.map((t) => t.id)).size).toBe(106);
    expect(tiles.filter((t) => t.joker)).toHaveLength(2);
    for (const c of ["red", "blue", "orange", "black"])
      for (let n = 1; n <= 13; n++)
        expect(tiles.filter((t) => t.color === c && t.num === n)).toHaveLength(
          2,
        );
  });
  it("shuffles repeatably without losing tiles", () => {
    expect(shuffle(tiles, random(9))).toEqual(shuffle(tiles, random(9)));
    expect(shuffle(tiles, random(9))).not.toEqual(tiles);
  });
});
describe("meld validation", () => {
  it("requires three tiles and unique colours in a group", () => {
    expect(inspectMeld([6, 32, 58]).valid).toBe(true);
    expect(inspectMeld([6, 32, 58, 84]).valid).toBe(true);
    expect(inspectMeld([6, 19, 32]).valid).toBe(false);
    expect(inspectMeld([6, 32]).valid).toBe(false);
  });
  it("rejects repeated ids, wrong colours, duplicate numbers, and wrapping", () => {
    for (const ids of [
      [0, 0, 1],
      [0, 1, 28],
      [11, 12, 0],
      [0, 13, 1],
      [1, 2, 4],
    ])
      expect(inspectMeld(ids).valid).toBe(false);
  });
  it("orders runs and fills gaps before extending high", () => {
    const m = inspectMeld([5, 3, 104]);
    expect(m.ordered).toEqual([3, 104, 5]);
    expect(m.values[104]).toBe(5);
    expect(m.points).toBe(15);
    expect(inspectMeld([3, 4, 104]).values[104]).toBe(6);
  });
  it("keeps jokers within 1–13 and scores groups correctly", () => {
    expect(inspectMeld([11, 12, 104]).values[104]).toBe(11);
    expect(inspectMeld([0, 104, 105]).points).toBe(3);
    expect(inspectMeld([9, 35, 104]).points).toBe(30);
    expect(inspectMeld(Array.from({ length: 13 }, (_, i) => i)).points).toBe(
      91,
    );
  });
});
