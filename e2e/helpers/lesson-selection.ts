import { expect, type Locator, type Page } from "@playwright/test";

export async function verifyLessonSelectionRecovery(
  page: Page,
  t: (s: string) => string,
  activate: (target: Locator) => Promise<void>,
) {
  const regular = await page.evaluate(() => localStorage.getItem("runset.save.v1"));
  const lesson = await page.evaluate(() => localStorage.getItem("runset.practice.v1"));
  const wrong = page.locator('.rack [data-tile-id="0"]');
  const tip = page.locator(".practice-feedback");
  const selectWrong = async () => {
    await activate(wrong);
    await expect(wrong).toHaveAttribute("aria-pressed", "true");
    await expect(tip).toHaveText(t("For this step, select red 10, blue 10, orange 10. Other tiles can wait."));
  };
  const cleared = async () => {
    await expect(page.locator(".rack .tile.selected")).toHaveCount(0);
    await expect(tip).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem("runset.save.v1"))).toBe(regular);
  };
  await selectWrong();
  await wrong.focus();
  await page.keyboard.press("Escape");
  await cleared();
  await selectWrong();
  await activate(page.getByRole("button", {name: t("Deselect all"), exact: true}).first());
  await cleared();
  expect(await page.evaluate(() => localStorage.getItem("runset.practice.v1"))).toBe(lesson);
  await selectWrong();
  await activate(page.getByRole("button", {name: t("Reset turn"), exact: true}));
  await cleared();
  await expect(page.locator(".rack .tile")).toHaveCount(14);
  await expect(page.locator(".practice-panel h1")).toHaveText(t("Make a group"));
}
