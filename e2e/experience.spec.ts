import { test, expect } from "@playwright/test";
import assert from "node:assert/strict";
test("learn, preserve, delete and resize a round", async ({ page: p }) => {
  const errors: string[] = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto("/");
  await p.getByRole("button", { name: "New game", exact: false }).click();
  await p.getByRole("button", { name: "Deal the tiles" }).click();
  await p.getByRole("button", { name: "Home", exact: true }).click();
  const saved = await p.evaluate(() => localStorage.getItem("runset.save.v1"));
  await p
    .getByRole("button", { name: "Delete saved game", exact: true })
    .click();
  await p.getByRole("button", { name: "Keep game" }).press("Escape");
  assert.equal(
    await p.evaluate(() => localStorage.getItem("runset.save.v1")),
    saved,
  );
  await p.getByRole("button", { name: "Learn to play" }).click();
  for (const names of [
    ["red 10", "blue 10", "orange 10"],
    ["red 1", "red 2", "red 3"],
  ]) {
    for (const name of names)
      await p.getByRole("button", { name, exact: true }).click();
    await p.getByRole("button", { name: /New group or run/ }).click();
  }
  await p.getByRole("button", { name: /I see/ }).click();
  await p.getByRole("button", { name: "End turn →", exact: true }).click();
  await p.getByRole("button", { name: /Watch Juniper/ }).click();
  await p.getByRole("button", { name: /Draw a tile/ }).click();
  await p.getByRole("button", { name: "red 13", exact: true }).first().click();
  await p.getByRole("button", { name: /New group or run/ }).click();
  await p.getByRole("button", { name: /Reset turn/ }).click();
  await p.getByRole("heading", { name: "You know the basics" }).waitFor();
  assert.equal(
    await p.evaluate(() => localStorage.getItem("runset.save.v1")),
    saved,
  );
  await p.getByRole("button", { name: "Exit practice" }).click();
  await p
    .getByRole("button", { name: "Delete saved game", exact: true })
    .click();
  await p.getByRole("button", { name: "Delete game", exact: true }).click();
  await p.reload();
  assert.equal(
    await p.getByRole("button", { name: "Continue game" }).count(),
    0,
  );
  assert.ok(await p.evaluate(() => localStorage.getItem("runset.practice.v1")));
  await p.getByRole("button", { name: "New game", exact: false }).click();
  await p.getByRole("button", { name: "Deal the tiles" }).click();
  await p.waitForFunction(() => {
    const s = JSON.parse(localStorage.getItem("runset.save.v1"));
    return !s.players[s.current].bot;
  });
  for (const [width, height] of [
    [360, 800],
    [375, 667],
    [390, 844],
    [430, 932],
    [768, 1024],
    [820, 1180],
    [1180, 820],
    [1440, 900],
  ]) {
    await p.setViewportSize({ width, height });
    assert.ok(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `${width} overflow`,
    );
    const tile = await p.locator(".rack .tile").first().boundingBox();
    assert.ok(tile.width >= 44 && tile.height >= 44);
  }
  expect(errors).toEqual([]);
});

test("hints preview before placement and penalty warnings keep edits", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const { practiceGame } = await import("/src/engine/practice.ts");
    localStorage.setItem("runset.save.v1", JSON.stringify(practiceGame()));
  });
  await page.reload();
  await page.getByRole("button", { name: "Continue game" }).click();
  const original = await page.evaluate(() =>
    localStorage.getItem("runset.save.v1"),
  );
  await page.getByRole("button", { name: "Show a possible move" }).click();
  await page.getByRole("button", { name: "Place hint", exact: true }).waitFor();
  expect(
    await page.evaluate(() => localStorage.getItem("runset.save.v1")),
  ).toBe(original);
  await page.getByRole("button", { name: "Place hint", exact: true }).click();
  expect(await page.locator(".table .tile").count()).toBeGreaterThan(0);
  expect(await page.getByRole("heading", { name: "Your move." }).count()).toBe(
    1,
  );
  await page.getByRole("button", { name: /Reset turn/ }).click();
  await page
    .getByRole("button", { name: "red 13", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: /New group or run/ }).click();
  await page
    .getByRole("button", { name: "+3 tiles · End turn", exact: true })
    .click();
  await page.getByRole("dialog").waitFor();
  await page.getByRole("button", { name: "Keep editing" }).click();
  expect(await page.locator(".table .tile").count()).toBe(1);
  await page
    .getByRole("button", { name: "+3 tiles · End turn", exact: true })
    .click();
  await page.getByRole("button", { name: "Reset turn instead" }).click();
  expect(await page.locator(".table .tile").count()).toBe(0);
  expect(await page.locator(".rack .tile").count()).toBe(14);
});
