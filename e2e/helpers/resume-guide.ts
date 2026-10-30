import {
  expect,
  type Page,
  type BrowserContext,
  type TestInfo,
  type Locator,
} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { landscapePosition } from "./landscape";
import { reducer } from "../../src/engine/game";
import { validSave } from "../../src/lib/storage";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";
export async function verifyResumeGuide(
  page: Page,
  context: BrowserContext,
  info: TestInfo,
  locale: "en" | "zh-CN",
  offline = true,
) {
  const t = locale === "en" ? (s: string) => s : translator(messages);
  const original = landscapePosition(),
    now = Date.now();
  delete original.match;
  original.coach = false;
  original.players[0].name = "constructor";
  await page.clock.install({ time: now });
  if (locale === "en") {
    original.deadline = now + 120000;
  } else {
    delete original.deadline;
    delete original.turnSeconds;
  }
  const game = reducer(original, { type: "move", ids: [3, 4], target: "new" });
  expect(validSave(game)).toBe(true);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({
    reducedMotion: "reduce",
    colorScheme: locale === "en" ? "light" : "dark",
  });
  await page.addInitScript(
    ({ game, locale }) => {
      if (sessionStorage.getItem("resume-seeded")) return;
      sessionStorage.setItem("resume-seeded", "true");
      localStorage.setItem("runset.save.v1", JSON.stringify(game));
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.pace", "5000");
      localStorage.setItem("runset.reading", String(locale === "zh-CN"));
    },
    { game, locale },
  );
  const activate = async (el: Locator) => {
    await el.scrollIntoViewIfNeeded();
    expect(
      await el.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return (
          r.width >= 44 &&
          r.height >= 44 &&
          r.top >= 0 &&
          r.bottom <= innerHeight &&
          r.left >= 0 &&
          r.right <= innerWidth &&
          el.contains(
            document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
          )
        );
      }),
    ).toBe(true);
    if (info.project.name === "firefox-desktop") await el.click();
    else await el.tap();
  };
  const save = () =>
    page.evaluate(() => localStorage.getItem("runset.save.v1"));
  const button = (name: string) =>
    page.getByRole("button", { name: t(name), exact: true });
  await page.goto("/");
  if (offline) {
    await expect(
      page.getByRole("status").filter({ hasText: t("Ready offline") }),
    ).toBeVisible();
    await context.setOffline(true);
    await page.reload();
  }
  const before = await save(),
    guide = page.locator(".resume-context");
  await expect(guide).toContainText(t("Next when you continue"));
  await expect(guide).toContainText(
    t("Complete the red-outlined group or run, or Reset."),
  );
  await expect(guide).toContainText(
    t("Unfinished moves kept. Check the table before ending your turn."),
  );
  await expect(guide).toContainText(t("After continuing, Undo takes back one move. Reset restores this turn without a penalty."));
  await expect(page.locator(".save-summary")).toContainText("constructor");
  expect(await save()).toBe(before);
  await activate(button("Continue game →"));
  await expect(page.locator(".save-indicator")).toHaveText(t("Saved"));
  await activate(button("Undo move"));
  await expect.poll(async () => JSON.parse((await save())!)).toEqual(reducer(game, {type:"undo"}));
  const rebuildDraft = async () => {
    for (const id of [3,4]) await activate(page.locator(`.rack [data-tile-id="${id}"]`));
    await activate(page.locator("main.game .new-meld"));
    await expect.poll(async () => JSON.parse((await save())!).history.length).toBe(1);
    await expect(page.locator(".save-indicator")).toHaveText(t("Saved"));
  };
  await rebuildDraft();
  await activate(button("Reset turn"));
  await expect.poll(async () => JSON.parse((await save())!).history.length).toBe(0);
  const reset = JSON.parse((await save())!);
  expect(reset.table).toEqual(original.table);
  expect(reset.players[0].rack).toEqual(original.players[0].rack);
  expect(reset.deadline).toBe(game.deadline);
  expect(reset.history).toEqual([]);
  expect(reset.pool).toEqual(original.pool);
  await rebuildDraft();
  const beforeHelp = await save();
  await activate(page.locator(".more-actions > summary"));
  await activate(page.locator(".current-turn-help > summary"));
  await expect(page.locator(".current-turn-help")).toContainText(t("Complete the red-outlined group or run, or use Reset to undo this turn without a penalty."));
  expect(await save()).toBe(beforeHelp);
  await activate(page.locator(".more-actions > summary"));
  await activate(page.locator('.rack [data-tile-id="5"]'));
  await expect(page.locator('.rack [data-tile-id="5"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await activate(button("Add selected tiles to meld 7"));
  await expect
    .poll(async () => JSON.parse((await save())!).history.length)
    .toBe(2);
  const ready = await save();
  expect(JSON.parse(ready!).deadline).toBe(game.deadline);
  await activate(button("Home"));
  await expect(guide).toContainText(
    t("Ready: choose End turn to keep this play."),
  );
  expect(await save()).toBe(ready);
  await page.evaluate(() => localStorage.setItem("runset.simpleHome", "true"));
  await page.reload();
  await expect(page.locator(".simple-home")).toBeVisible();
  await expect(guide).toContainText(
    t("Ready: choose End turn to keep this play."),
  );
  await expect(guide).toContainText(
    t(
      locale === "en"
        ? "Timed game: the original deadline still applies. If it has passed, continuing processes the expired turn."
        : "No timer. Resume whenever you like.",
    ),
  );
  expect(await save()).toBe(ready);
  expect(
    (await new AxeBuilder({ page }).include(".simple-home").analyze())
      .violations,
  ).toEqual([]);
  expect(
    await guide
      .locator("p")
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
  ).toBeGreaterThanOrEqual(locale === "en" ? 16 : 18);
  await guide.scrollIntoViewIfNeeded();
  expect(
    await guide.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return r.left >= 0 && r.right <= innerWidth;
    }),
  ).toBe(true);
  await page.screenshot({
    path: `/tmp/runset-resume-guide-${info.project.name || "chromium"}-${locale}.png`,
  });
  if (locale === "en") {
    await page.clock.fastForward(120001);
    await expect(guide).toContainText(t("Time has run out for this turn. Continuing resets unfinished edits, draws one tile and ends this turn."));
    await expect(guide).not.toContainText(t("Ready: choose End turn to keep this play."));
  } else {
    await page.clock.fastForward(7 * 86400000);
    await expect(guide).toContainText(t("Ready: choose End turn to keep this play."));
  }
  expect(await save()).toBe(ready);
  await activate(button("Continue game →"));
  if (locale === "en") {
    await expect.poll(async () => JSON.parse((await save())!).turn).toBe(game.turn + 1);
    const expired = JSON.parse((await save())!);
    expect(expired.table).toEqual(original.table);
    expect(expired.players[0].rack).toEqual([...original.players[0].rack, original.pool[0]]);
    expect(expired.pool).toEqual(original.pool.slice(1));
    expect(expired.history).toEqual([]);
  } else expect(await save()).toBe(ready);
  expect(validSave(JSON.parse((await save())!))).toBe(true);
  expect(errors).toEqual([]);
}
