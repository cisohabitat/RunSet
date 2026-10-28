import { expect, it } from "vitest";
import { meldOverview } from "./meldOverview";
it("summarises actual groups and joker run values without changing tile order", () => {
  const ids = [5, 104, 3],
    before = [...ids];
  expect(meldOverview(ids)).toMatchObject({
    valid: true,
    kind: "run",
    colour: "red",
    numbers: "4–6",
    points: 15,
    first: 3,
    count: 3,
  });
  expect(ids).toEqual(before);
  expect(meldOverview([9, 35, 61])).toMatchObject({
    valid: true,
    kind: "group",
    colour: null,
    numbers: "10",
    points: 30,
  });
});
it("does not invent represented numbers or points for an unfinished meld", () => {
  expect(meldOverview([0, 1])).toMatchObject({
    valid: false,
    kind: null,
    colour: null,
    numbers: "",
    points: 0,
    count: 2,
  });
});

it("keeps an empty imported draft non-navigable", () => {
  expect(meldOverview([])).toMatchObject({
    valid: false,
    count: 0,
    first: undefined,
  });
});
