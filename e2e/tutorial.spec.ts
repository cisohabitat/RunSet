import { test, expect } from "@playwright/test";

for (const [device, width, height, touch] of [
  ["phone", 375, 667, true],
  ["tablet", 820, 1180, true],
  ["desktop", 1440, 900, false],
] as const) {
  test(`${device}: complete all Learn to Play lessons and resume practice`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height }, hasTouch: touch });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", e => errors.push(e.message));
    const click = async (name: string | RegExp, exact = true) => {
      const button = page.getByRole("button", { name, exact }).first();
      if (touch) await button.tap(); else await button.click();
    };
    const place = async (names: (string | RegExp)[]) => {
      for (const name of names) await click(name);
      await click(/New group or run/);
    };
    await page.goto("/");
    await click(/Learn to play/);
    await place(["red 10", "blue 10", "orange 10"]);
    expect(await page.locator(".new-meld").evaluate(el => {
      const r = el.getBoundingClientRect(), table = el.closest(".table").getBoundingClientRect();
      return r.top >= table.top && r.bottom <= table.bottom;
    })).toBe(true);
    await click("Exit practice");
    await page.reload();
    await click(/Learn to play/);
    await expect(page.getByRole("heading", { name: "Make a run" })).toBeVisible();
    await place(["red 1", "red 2", "red 3"]);
    // Check geometry before clicking: Playwright otherwise scrolls hidden controls into view.
    const next = page.getByRole("button", { name: /I see/ });
    expect(await next.evaluate(el => {
      const r = el.getBoundingClientRect();
      return r.top >= 0 && r.bottom <= innerHeight && document.elementFromPoint(r.x + r.width / 2, r.bottom - 2) === el;
    })).toBe(true);
    await click(/I see/);
    await click("End turn →");
    expect(await page.getByRole("button", { name: /Watch Juniper/ }).evaluate(el => {
      const r = el.getBoundingClientRect();
      return r.top >= 0 && r.bottom <= innerHeight && document.elementFromPoint(r.x + r.width / 2, r.bottom - 2) === el;
    })).toBe(true);
    await click(/Watch Juniper/);
    await click(/Draw a tile/);
    await place(["red 13"]);
    await click("Reset turn");
    await expect(page.getByRole("heading", { name: "You know the basics" })).toBeVisible();
    await click("Jokers");
    await click("red 5");
    await click("Add selected tiles to meld 1");
    await place([/^Joker representing/, "blue 5", "orange 5"]);
    await expect(page.getByRole("button", { name: /Play against one Easy/ })).toBeVisible();
    await click("Rearranging");
    await place(["red 4", "red 5", "red 6", "red 7"]);
    await expect(page.getByRole("button", { name: /Play against one Easy/ })).toBeVisible();
    expect(errors).toEqual([]);
    expect(await page.evaluate(() => localStorage.getItem("runset.save.v1"))).toBeNull();
    await context.close();
  });
}

test("basics recovers when Reset is used after acknowledging opening points", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Learn to play/ }).click();
  for (const names of [["red 10", "blue 10", "orange 10"], ["red 1", "red 2", "red 3"]]) {
    for (const name of names) await page.getByRole("button", { name, exact: true }).click();
    await page.getByRole("button", { name: /New group or run/ }).click();
  }
  await page.getByRole("button", { name: /I see/ }).click();
  const acknowledged = await page.evaluate(() => localStorage.getItem("runset.practice.v1"));
  await page.getByRole("button", { name: "Undo move", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Make a run", exact: true })).toBeVisible();
  // Restore the acknowledged position, then exercise Reset and legacy recovery.
  await page.evaluate(saved => localStorage.setItem("runset.practice.v1", saved!), acknowledged);
  await page.reload();
  await page.getByRole("button", { name: /Learn to play/ }).click();
  await page.getByRole("button", { name: "Reset turn", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Make a group", exact: true })).toBeVisible();
  await page.evaluate(() => {
    const progress = JSON.parse(localStorage.getItem("runset.practice.v1")!);
    progress.step = 3;
    localStorage.setItem("runset.practice.v1", JSON.stringify(progress));
  });
  await page.reload();
  await page.getByRole("button", { name: /Learn to play/ }).click();
  await expect(page.getByRole("heading", { name: "Make a group", exact: true })).toBeVisible();
});

test("restarting a lesson clears the previous tile selection", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Learn to play/ }).click();
  await page.getByRole("button", { name: "red 13", exact: true }).first().click();
  await page.getByRole("button", { name: "Restart lesson", exact: true }).click();
  await expect(page.locator('.tile[aria-pressed="true"]')).toHaveCount(0);
  for (const name of ["red 10", "blue 10", "orange 10"])
    await page.getByRole("button", { name, exact: true }).click();
  await page.getByRole("button", { name: /New group or run/ }).click();
  await expect(page.getByRole("heading", { name: "Make a run", exact: true })).toBeVisible();
});

test("out-of-sequence Draw and End explain the next step without changing practice", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Learn to play/ }).click();
  await page.getByRole("button", { name: /Draw a tile/ }).click();
  await expect(page.getByRole("status").filter({ hasText: "First finish this step" })).toContainText("Select the three 10s");
  for (const name of ["red 10", "blue 10", "orange 10"])
    await page.getByRole("button", { name, exact: true }).click();
  await page.getByRole("button", { name: /New group or run/ }).click();
  const before = await page.evaluate(() => localStorage.getItem("runset.practice.v1"));
  await page.getByRole("button", { name: "End turn →", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "First finish this step" })).toContainText("Select red 1, 2, and 3");
  expect(await page.evaluate(() => localStorage.getItem("runset.practice.v1"))).toBe(before);
});
