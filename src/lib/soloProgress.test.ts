import { expect, it } from "vitest";
import { completeSolo, emptySolo, validSolo, mergeSolo } from "./soloProgress";
it("records puzzle completions once and retains gentle milestones with bounded history", () => {
  let p = emptySolo();
  p = completeSolo(p, "opening", 4321);
  expect(completeSolo(p, "opening", 4321)).toBe(p);
  for (const kind of ["extend", "repair", "joker"] as const)
    p = completeSolo(p, kind, 4321);
  for (let n = 1; n <= 250; n++) p = completeSolo(p, "opening", n);
  expect(p.completed).toHaveLength(200);
  expect(p.kinds).toHaveLength(4);
  expect(validSolo(p)).toBe(true);
});
it("rejects malformed and conflicting progress instead of trusting storage", () => {
  for (const p of [
    null,
    {},
    { version: 2, completed: [], kinds: [] },
    { version: 1, completed: ["opening:0"], kinds: ["opening"] },
    { version: 1, completed: ["joker:1"], kinds: [] },
    { version: 1, completed: ["opening:1", "opening:1"], kinds: ["opening"] },
    { version: 1, completed: [], kinds: ["other"] },
    { version: 1, completed: [null], kinds: [] },
  ])
    expect(validSolo(p)).toBe(false);
});

it("converges separate tab completions without replaying a milestone", () => {
  const a = completeSolo(emptySolo(), "opening", 1),
    b = completeSolo(emptySolo(), "joker", 2);
  expect(mergeSolo(a, b)).toEqual(mergeSolo(b, a));
  const joined = mergeSolo(a, b);
  expect(mergeSolo(joined, a)).toBe(joined);
  expect(joined.completed).toHaveLength(2);
});
