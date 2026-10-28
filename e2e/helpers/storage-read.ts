import { expect, type Page, type BrowserContext } from "@playwright/test";
import { landscapePosition } from "./landscape";
import { reducer } from "../../src/engine/game";
import { validSave } from "../../src/lib/storage";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";
export async function verifyStorageRead(page: Page, context: BrowserContext, locale: "en" | "zh-CN", offline: boolean) {
  const t = locale === "en" ? (s: string) => s : translator(messages), original = landscapePosition();
  original.coach = false;
  const game = reducer(original, { type: "move", ids: [3, 4], target: "new" });
  expect(validSave(game)).toBe(true);
  const raw = JSON.stringify(game), backup = JSON.stringify(original), errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.addInitScript(({ raw, backup, locale }) => {
    if (!sessionStorage.getItem("read-fault-seeded")) {
      sessionStorage.setItem("read-fault-seeded", "1");
      sessionStorage.setItem("read-fault-block", "1");
      localStorage.setItem("runset.save.v1", raw);
      localStorage.setItem("runset.backup.v1", backup);
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.reading", String(locale === "zh-CN"));
    }
    const read = Storage.prototype.getItem;
    (window as any).__readActualSave = () => read.call(localStorage, "runset.save.v1");
    Storage.prototype.getItem = function (key: string) {
      if (this === localStorage && key === "runset.save.v1" && read.call(sessionStorage, "read-fault-block") === "1") throw new DOMException("Temporary read failure", "SecurityError");
      return read.call(this, key);
    };
  }, { raw, backup, locale });
  await page.goto("/");
  await expect(page.getByRole("status").filter({ hasText: t("Your save could not be read. Reload to try again. Your stored data has not been removed.") })).toBeVisible();
  await page.screenshot({ path: `/tmp/runset-storage-read-${locale}.png` });
  if (offline) {
    await expect(page.getByRole("status").filter({ hasText: t("Ready offline") })).toBeVisible();
    await context.setOffline(true);
  }
  expect(await page.evaluate(() => (window as any).__readActualSave())).toBe(raw);
  expect(await page.evaluate(() => localStorage.getItem("runset.backup.v1"))).toBe(backup);
  await expect(page.getByRole("button", { name: t("Continue game →"), exact: true })).toHaveCount(0);
  await page.evaluate(() => sessionStorage.removeItem("read-fault-block"));
  await page.reload();
  await page.getByRole("button", { name: t("Continue game →"), exact: true }).click();
  await expect(page.locator('.table [data-tile-id="3"]')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("runset.save.v1"))).toBe(raw);
  const undo = page.getByRole("button", { name: t("Undo move"), exact: true });
  await expect(undo).toBeEnabled();
  await undo.click();
  await expect.poll(async () => page.evaluate(() => JSON.parse(localStorage.getItem("runset.save.v1")!).table)).toEqual(original.table);
  const restored = await page.evaluate(() => JSON.parse(localStorage.getItem("runset.save.v1")!));
  expect(validSave(restored)).toBe(true);
  expect(restored.players[0].rack).toEqual(original.players[0].rack);
  expect(restored.deadline).toBe(original.deadline);
  expect(await page.evaluate(() => localStorage.getItem("runset.language"))).toBe(locale);
  // An unreadable cross-tab notification is not a deletion of the live game.
  await page.locator('.rack [data-tile-id="3"]').click();
  const beforeEvent = await page.evaluate(() => localStorage.getItem("runset.save.v1"));
  await page.evaluate(() => {
    sessionStorage.setItem("read-fault-block", "1");
    dispatchEvent(new StorageEvent("storage", { key: "runset.save.v1" }));
  });
  await expect(page.getByRole("status").filter({ hasText: t("Your save could not be read. Reload to try again. Your stored data has not been removed.") })).toBeVisible();
  await expect(page.locator('.rack [data-tile-id="3"]')).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => (window as any).__readActualSave())).toBe(beforeEvent);
  await page.evaluate(() => {
    sessionStorage.removeItem("read-fault-block");
    dispatchEvent(new StorageEvent("storage", { key: "runset.save.v1" }));
  });
  await expect(page.getByRole("status").filter({ hasText: t("Updated to the game saved in another tab.") })).toBeVisible();
  await expect(page.locator(".rack")).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("runset.save.v1"))).toBe(beforeEvent);
  expect(errors).toEqual([]);
}
