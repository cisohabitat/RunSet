import { expect, type Page, type BrowserContext, type Locator, type TestInfo } from "@playwright/test";
import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { landscapePosition } from "./landscape";
import { chooseView } from "./view";
import { emitVisual } from "./ci-visual";
import { importBackup } from "../../src/lib/backup";
import { validSave } from "../../src/lib/storage";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";

export async function verifyPlayerComfortRelease(
  { page, context }: { page: Page; context: BrowserContext },
  info: TestInfo,
  locale: "en" | "zh-CN",
  offline = true,
) {
  const t = locale === "en" ? (s: string) => s : translator(messages);
  const game = landscapePosition();
  delete game.match;
  game.coach = false;
  const keep = [3, 4, 5];
  game.pool.push(...game.players[0].rack.filter(id => !keep.includes(id)));
  game.players[0].rack = [...keep];
  game.turnStart.rack = [...keep];
  expect(validSave(game)).toBe(true);
  await page.emulateMedia({ colorScheme: locale === "en" ? "light" : "dark", reducedMotion: "reduce" });
  await page.addInitScript(({ game, locale }) => {
    if (sessionStorage.getItem("comfort-release-seeded")) return;
    sessionStorage.setItem("comfort-release-seeded", "1");
    localStorage.setItem("runset.save.v1", JSON.stringify(game));
    localStorage.setItem("runset.language", locale);
    localStorage.setItem("runset.reading", String(locale === "zh-CN"));
    localStorage.setItem("runset.muted", "true");
  }, { game, locale });
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  const activate = async (el: Locator) => {
    await el.scrollIntoViewIfNeeded();
    expect(await el.evaluate(el => {
      const r = el.getBoundingClientRect();
      return r.width >= 44 && r.height >= 44 && r.top >= 0 && r.bottom <= innerHeight &&
        r.left >= 0 && r.right <= innerWidth &&
        el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
    })).toBe(true);
    if (info.project.name === "firefox-desktop") await el.click(); else await el.tap();
  };
  const button = (name: string) => page.getByRole("button", { name: t(name), exact: true });
  const save = () => page.evaluate(() => localStorage.getItem("runset.save.v1"));
  const state = async () => {
    const raw = await save();
    return raw ? JSON.parse(raw) : null;
  };
  const more = page.locator(".more-actions");
  const menu = async () => {
    if (!(await more.evaluate((el: HTMLDetailsElement) => el.open)))
      await activate(more.locator(":scope > summary"));
  };
  await page.goto("/");
  if (offline) {
    await expect(page.getByRole("status").filter({ hasText: t("Ready offline") })).toBeVisible();
    await context.setOffline(true);
  }
  await activate(button("Continue game →"));
  for (const id of [3, 4]) await activate(page.locator('.rack [data-tile-id="' + id + '"]'));
  await activate(page.locator(".new-meld"));
  await expect.poll(async () => (await state())?.table.length).toBe(7);
  await expect.poll(async () => (await state())?.history.length).toBe(1);
  const draft = await save();
  expect((await state()).deadline).toBe(game.deadline);
  await page.reload();
  await activate(button("Continue game →"));
  await expect(page.getByRole("button", { name: t("Undo move"), exact: true })).toBeEnabled();
  expect(await save()).toBe(draft);

  await menu();
  await expect(page.getByRole("region", { name: t("Help with this turn"), exact: true })).toContainText(t("What can I do now?"));
  await expect(page.getByRole("region", { name: t("Find and arrange tiles"), exact: true }).getByRole("button", { name: t("Table overview"), exact: true })).toBeEnabled();
  await expect(page.getByRole("region", { name: t("Game details"), exact: true })).toContainText(t("Opponent styles and fair play"));
  const guide = page.locator(".opponent-guide");
  await activate(guide.locator(":scope > summary"));
  await expect(guide.locator("li strong")).toHaveText(game.players[1].name);
  await expect(guide).toContainText(t("easy"));
  await activate(guide.locator(":scope > summary"));
  expect(await save()).toBe(draft);
  await activate(button("Table overview"));
  const overview = page.getByRole("dialog", { name: t("Table overview"), exact: true });
  await expect(overview.locator("li")).toHaveCount(7);
  await expect(overview.locator("li").last()).toContainText(t("Needs fixing"));
  await activate(overview.locator("li").last().getByRole("button"));
  await expect(overview).not.toBeVisible();
  const affected = page.locator('.table [data-tile-id="3"]');
  await expect(affected).toBeFocused();
  expect(await save()).toBe(draft);

  await menu();
  await activate(button("Why this move?"));
  const help = page.getByRole("dialog", { name: t("Move help"), exact: true });
  await expect(help).toContainText(t("Affected group/run 7"));
  await expect(help.getByRole("region", { name: t("One tile you can add") }).locator('[data-tile-id="5"]')).toBeVisible();
  await activate(help.getByRole("button", { name: t("Find affected tiles"), exact: true }));
  await expect(help).not.toBeVisible();
  await expect(affected).toBeFocused();
  await expect(page.locator('.game .tile[aria-pressed="true"]')).toHaveCount(0);
  expect(await save()).toBe(draft);

  await activate(page.locator('.rack [data-tile-id="5"]'));
  await chooseView(page, "table", t);
  await expect(page.locator(".rack")).not.toBeVisible();
  expect(await save()).toBe(draft);
  await activate(page.getByRole("button", { name: t("Add selected tiles to meld 7"), exact: true }));
  await expect.poll(async () => (await state())?.history.length).toBe(2);
  expect((await state()).players[0].rack).toEqual([]);
  await activate(button("End turn →"));
  await expect(page.locator(".game-over")).toBeVisible();
  await expect.poll(async () => (await state())?.phase).toBe("over");
  const finalState = await state();
  expect(validSave(finalState)).toBe(true);
  const ids = [...finalState.pool, ...finalState.players.flatMap((p: { rack: number[] }) => p.rack), ...finalState.table.flatMap((m: { tiles: number[] }) => m.tiles)];
  expect(ids).toHaveLength(106);
  expect(new Set(ids).size).toBe(106);
  expect(finalState.deadline).toBe(game.deadline);
  await expect(page.getByText(t("The round ended because a rack is empty."), { exact: true })).toBeVisible();
  await expect(page.locator(".confetti i")).toHaveCount(12);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe("hidden");
  expect((await new AxeBuilder({ page }).include(".game-over").analyze()).violations).toEqual([]);
  await emitVisual(page, info, locale, "player-release-result");
  const finishedRaw = await save();
  const reviewOpener = button("Review latest play");
  await activate(reviewOpener);
  const review = page.getByRole("dialog", { name: t("Where the latest tiles landed"), exact: true });
  await expect(review).toContainText(t("A run has at least three consecutive numbers in one colour. A joker can stand for a missing number."));
  await activate(review.getByText(t("See all destinations"), { exact: true }));
  await expect(review.locator(".review-destinations li")).toHaveCount(1);
  await expect(review.locator(".review-destinations li")).toContainText(`${t("Latest-play tiles here:")} 3`);
  expect((await new AxeBuilder({ page }).include(".move-review").analyze()).violations).toEqual([]);
  expect(await save()).toBe(finishedRaw);
  await page.screenshot({ path: `/tmp/runset-everyday-release-review-${info.project.name || "chromium"}-${locale}.png` });
  await emitVisual(page, info, locale, "everyday-play-review");
  await activate(review.getByRole("button", { name: t("Close review"), exact: true }));
  await expect(review).toHaveCount(0);
  await expect(reviewOpener).toBeFocused();
  expect(await save()).toBe(finishedRaw);

  await activate(page.locator(".game-over").getByRole("button", { name: t("Home"), exact: true }));
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    activate(button("Export game backup")),
  ]);
  const path = await download.path();
  expect(path).not.toBeNull();
  const raw = await readFile(path!, "utf8");
  expect(importBackup(raw)).toEqual(finalState);
  const preferenceKeys = ["runset.language", "runset.reading", "runset.muted", "runset.tableExpanded"];
  const preferences = await page.evaluate(keys => Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)])), preferenceKeys);
  await activate(button("Delete saved game"));
  await activate(button("Delete game"));
  await expect.poll(save).toBeNull();
  await expect(button("View results →")).toHaveCount(0);
  await expect(button("Export game backup")).toBeDisabled();
  expect(await page.evaluate(() => localStorage.getItem("runset.backup.v1"))).toBeNull();
  expect(await page.evaluate(keys => Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)])), preferenceKeys)).toEqual(preferences);

  await page.getByLabel(t("Import game backup"), { exact: true }).setInputFiles({
    name: "finished-game.json", mimeType: "application/json", buffer: Buffer.from(raw),
  });
  await expect(page.locator(".game-over")).toBeVisible();
  await expect.poll(async () => (await state())?.phase).toBe("over");
  expect(await state()).toEqual(finalState);
  await expect(page.locator(".confetti")).toHaveCount(0);
  await page.reload();
  await activate(button("View results →"));
  await expect(page.locator(".game-over")).toBeVisible();
  await expect(page.locator(".confetti")).toHaveCount(0);
  expect(await state()).toEqual(finalState);
  expect(await page.evaluate(keys => Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)])), preferenceKeys)).toEqual(preferences);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
}
