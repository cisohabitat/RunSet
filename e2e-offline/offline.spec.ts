import { test, expect } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";
test("production assets, lessons and a saved round survive offline reload", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await page.getByRole("button", { name: "New game", exact: false }).click();
  await page.getByRole("button", { name: "Deal the tiles" }).click();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  const saved = await page.evaluate(() =>
    localStorage.getItem("runset.save.v1"),
  );
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("button", { name: "Continue game" }).click();
  await expect(page.getByRole("region", { name: "Your rack" })).toBeVisible();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page.getByRole("button", { name: "Learn to play" }).click();
  await expect(
    page.getByRole("heading", { name: "Make a group" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("runset.save.v1")),
  ).toBe(saved);
  await context.setOffline(false);
});
test("an explicit worker update keeps the saved game", async ({ page }) => {
  const original = await readFile("dist/sw.js", "utf8");
  try {
    await page.goto("/");
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await page.getByRole("button", { name: "New game", exact: false }).click();
    await page.getByRole("button", { name: "Deal the tiles" }).click();
    await page.getByRole("button", { name: "Home", exact: true }).click();
    const saved = await page.evaluate(() =>
      localStorage.getItem("runset.save.v1"),
    );
    await writeFile(
      "dist/sw.js",
      original.replace(/runset-[a-f0-9]{16}/, "runset-update-fixture"),
    );
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      await registration?.update();
    });
    await Promise.all([
      page.waitForEvent(
        "framenavigated",
        (frame) => frame === page.mainFrame(),
      ),
      page.getByRole("button", { name: "Save and update" }).click(),
    ]);
    await page.waitForLoadState("domcontentloaded");
    await expect(
      page.getByRole("button", { name: "Continue game" }),
    ).toBeVisible();
    expect(
      await page.evaluate(() => localStorage.getItem("runset.save.v1")),
    ).toBe(saved);
  } finally {
    await writeFile("dist/sw.js", original);
  }
});
