import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
test("exports, validates, confirms and restores game backups", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const { practiceGame } = await import("/src/engine/practice.ts");
    localStorage.setItem("runset.save.v1", JSON.stringify(practiceGame()));
  });
  await page.reload();
  await expect(page.getByText("Saved", { exact: true })).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export game backup" }).click();
  const downloaded = await downloadPromise,
    raw = await readFile((await downloaded.path())!, "utf8");
  const expected = JSON.parse(raw).game;
  await page
    .getByLabel("Import game backup", { exact: true })
    .setInputFiles({
      name: "broken.json",
      mimeType: "application/json",
      buffer: Buffer.from("{bad"),
    });
  await expect(
    page.getByRole("status").filter({ hasText: "not readable JSON" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("runset.save.v1")!),
    ),
  ).toEqual(expected);
  await page
    .getByLabel("Import game backup", { exact: true })
    .setInputFiles({
      name: "backup.json",
      mimeType: "application/json",
      buffer: Buffer.from(raw),
    });
  await page.getByRole("button", { name: "Keep game" }).click();
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("runset.save.v1")!),
    ),
  ).toEqual(expected);
  await page
    .getByRole("button", { name: "Delete saved game", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete game", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page
    .getByLabel("Import game backup", { exact: true })
    .setInputFiles({
      name: "backup.json",
      mimeType: "application/json",
      buffer: Buffer.from(raw),
    });
  await expect(page.getByRole("region", { name: "Your rack" })).toBeVisible();
  await expect(page.getByText("Saved", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("runset.save.v1")!),
    ),
  ).toEqual(expected);
});
test("recovers a validated previous position after corrupt saved data", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const { practiceGame } = await import("/src/engine/practice.ts");
    localStorage.setItem("runset.backup.v1", JSON.stringify(practiceGame()));
    localStorage.setItem("runset.save.v1", "{bad");
  });
  await page.reload();
  await page.getByRole("button", { name: "Recover previous position" }).click();
  await expect(page.getByRole("region", { name: "Your rack" })).toBeVisible();
  await expect(page.getByText("Saved", { exact: true })).toBeVisible();
  expect(await page.locator(".rack .tile").count()).toBe(14);
});
