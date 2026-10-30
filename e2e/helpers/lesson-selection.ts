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

export async function verifyLessonActionRecovery(
  page: Page,
  t: (s: string) => string,
  activate: (target: Locator) => Promise<void>,
  action: string,
  wrongId = 12,
) {
  const before = await page.evaluate(() => ({regular:localStorage.getItem("runset.save.v1"),lesson:localStorage.getItem("runset.practice.v1")}));
  const tile = page.locator(`.rack [data-tile-id="${wrongId}"]`);
  const expected = t(`No tiles are needed for this step. Choose ${action}.`);
  if (await page.locator("html").getAttribute("lang") === "zh-CN") expect(expected).not.toMatch(/[A-Za-z]/);
  await activate(tile);
  await expect(page.locator(".practice-feedback")).toHaveText(expected);
  await tile.focus();
  await page.keyboard.press("Escape");
  await expect(page.locator(".practice-feedback")).toHaveCount(0);
  await activate(tile);
  await activate(page.locator(".new-meld"));
  await expect(page.locator(".practice-feedback")).toHaveText(expected);
  const feedback = page.locator(".practice-feedback");
  await feedback.scrollIntoViewIfNeeded();
  const measure = () => feedback.evaluate(el => {
    const r = el.getBoundingClientRect();
    const clip = el.closest(".practice-copy")!.getBoundingClientRect();
    return {
      valid:r.top >= Math.max(0,clip.top) && r.bottom <= Math.min(innerHeight,clip.bottom)
        && r.left >= clip.left && r.right <= Math.min(innerWidth,clip.right),
      feedback:r.toJSON(),clip:clip.toJSON(),viewport:[innerWidth,innerHeight],
    };
  });
  try { await expect.poll(measure).toMatchObject({valid:true}); }
  catch(error) { console.log("LESSON_FEEDBACK_GEOMETRY "+JSON.stringify(await measure())); throw error; }
  if(action === "Reset") await page.screenshot({path:`/tmp/runset-lesson-action-${await page.locator("html").getAttribute("lang")}-${page.viewportSize()!.width}.png`});
  expect(await page.evaluate(() => ({regular:localStorage.getItem("runset.save.v1"),lesson:localStorage.getItem("runset.practice.v1")}))).toEqual(before);
}
