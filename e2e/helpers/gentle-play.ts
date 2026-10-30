import { expect, type Page, type BrowserContext, type Locator, type TestInfo } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { practiceGame } from "../../src/engine/practice";
import { reducer } from "../../src/engine/game";
import { exportBackup } from "../../src/lib/backup";
import { validSave } from "../../src/lib/storage";
import { landscapePosition } from "./landscape";
import { chooseView } from "./view";
import { emitVisual } from "./ci-visual";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";

export async function verifyGentlePlay(
  { page, context }: { page: Page; context: BrowserContext },
  info: TestInfo,
  locale: "en" | "zh-CN",
  offline = true,
) {
  const t = locale === "en" ? (s: string) => s : translator(messages);
  const base = practiceGame();
  base.pool.push(...base.players[0].rack.filter(id => ![9, 35, 61].includes(id)));
  base.players[0].rack = [9, 35, 61];
  base.turnStart.rack = [9, 35, 61];
  base.coach = false;
  const completed = reducer(reducer(base, { type: "move", ids: [9, 35, 61], target: "new" }), { type: "endTurn" });
  expect(validSave(base)).toBe(true);
  expect(validSave(completed)).toBe(true);
  expect(completed.phase).toBe("over");
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.emulateMedia({
    colorScheme: locale === "en" ? "light" : "dark",
    reducedMotion: locale === "en" ? "no-preference" : "reduce",
  });
  await page.addInitScript(({ base, locale }) => {
    (window as any).__runsetCueNotes = 0;
    (window as any).__runsetStoppedNotes = 0;
    (window as any).AudioContext = class {
      state = "running";
      currentTime = 0;
      destination = {};
      resume() { return Promise.resolve(); }
      createOscillator() {
        (window as any).__runsetCueNotes++;
        return { connect() {}, disconnect() {}, frequency: { value: 0 }, type: "sine", start() {}, stop(at?: number) { if (at === undefined) (window as any).__runsetStoppedNotes++; } };
      }
      createGain() {
        return { connect() {}, disconnect() {}, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} } };
      }
    };
    if (sessionStorage.getItem("gentle-seeded")) return;
    sessionStorage.setItem("gentle-seeded", "1");
    localStorage.setItem("runset.save.v1", JSON.stringify(base));
    localStorage.setItem("runset.language", locale);
    localStorage.setItem("runset.muted", "false");
    localStorage.setItem("runset.reading", String(locale === "zh-CN"));
  }, { base, locale });
  const activate = async (el: Locator) => {
    await el.scrollIntoViewIfNeeded();
    expect(await el.evaluate(el => {
      const r = el.getBoundingClientRect();
      return el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
    })).toBe(true);
    if (info.project.name === "firefox-desktop") await el.click(); else await el.tap();
  };
  const save = () => page.evaluate(() => localStorage.getItem("runset.save.v1"));
  const notes = () => page.evaluate(() => (window as any).__runsetCueNotes as number);
  const stopped = () => page.evaluate(() => (window as any).__runsetStoppedNotes as number);
  const home = () => activate(page.locator(".game-over").getByRole("button", { name: t("Home"), exact: true }));
  const finished = async () => {
    await expect(page.locator(".game-over")).toBeVisible();
    await expect.poll(async () => JSON.parse((await save())!).phase).toBe("over");
  };
  await page.goto("/");
  if (offline) {
    await expect(page.getByRole("status").filter({ hasText: t("Ready offline") })).toBeVisible();
    await context.setOffline(true);
  }
  // Restoring a completed game with the same seed is not a new win.
  await page.getByLabel(t("Import game backup"), { exact: true }).setInputFiles({
    name: "completed.json", mimeType: "application/json",
    buffer: Buffer.from(exportBackup(completed)),
  });
  await activate(page.getByRole("button", { name: t("Restore backup"), exact: true }));
  await finished();
  await expect(page.locator(".confetti")).toHaveCount(0);
  expect(await notes()).toBe(0);

  await home();
  await page.evaluate(base => localStorage.setItem("runset.save.v1", JSON.stringify(base)), base);
  await page.reload();
  await activate(page.getByRole("button", { name: t("Continue game →"), exact: true }));
  for (const id of [9, 35, 61]) await activate(page.locator('.rack [data-tile-id="' + id + '"]'));
  await activate(page.locator(".new-meld"));
  await expect.poll(async () => JSON.parse((await save())!).table.length).toBe(1);
  const beforeEnd = await notes();
  await activate(page.getByRole("button", { name: t("End turn →"), exact: true }));
  await finished();
  expect(await notes()).toBe(beforeEnd + 4);
  await expect(page.locator(".confetti i")).toHaveCount(12);
  await expect(page.locator(".victory-mark")).toHaveAttribute("aria-hidden","true");
  expect(await page.locator(".victory-mark").evaluate(el=>getComputedStyle(el).animationName)).toBe(locale==="en"?"victory-settle":"none");
  if (locale === "zh-CN") await expect(page.locator(".confetti")).toBeHidden();
  expect(await notes()).toBeGreaterThan(0);
  await emitVisual(page, info, locale, "fresh-result");
  const afterWin = await notes();
  const beforeSoundSetting = await save();
  await activate(page.locator(".site-header").getByRole("button", {name: t("Settings"), exact: true}));
  const settings = page.getByRole("dialog", {name: t("Settings"), exact: true});
  await settings.getByLabel(t("Sound effects"), {exact: true}).uncheck();
  await expect.poll(stopped).toBe(afterWin);
  await settings.getByLabel(t("Sound effects"), {exact: true}).check();
  expect(await notes()).toBe(afterWin);
  expect(await save()).toBe(beforeSoundSetting);
  await activate(settings.getByRole("button", {name: t("Done"), exact: true}).first());

  await home();
  await activate(page.getByRole("button", { name: t("View results →"), exact: true }));
  await finished();
  await expect(page.locator(".confetti")).toHaveCount(0);
  expect(await notes()).toBe(afterWin);
  expect(await page.locator(".victory-mark").evaluate(el=>getComputedStyle(el).animationName)).toBe("none");
  await page.reload();
  await activate(page.getByRole("button", { name: t("View results →"), exact: true }));
  await finished();
  await expect(page.locator(".confetti")).toHaveCount(0);
  expect(await notes()).toBe(0);

  await home();
  const next = landscapePosition();
  delete next.match;
  next.coach = false;
  await page.evaluate(next => {
    localStorage.setItem("runset.save.v1", JSON.stringify(next));
    localStorage.setItem("runset.pace", "2400");
  }, next);
  await page.reload();
  await activate(page.getByRole("button", { name: t("Continue game →"), exact: true }));
  await expect(page.locator(".rack")).toBeVisible();
  const beforeView = await save();
  const selected = page.locator('.rack [data-tile-id="3"]');
  await activate(selected);
  const beforeHide = await stopped();
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {configurable: true, value: true});
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect.poll(stopped).toBe(beforeHide + 1);
  await expect(selected).toHaveAttribute("aria-pressed", "true");
  expect(await save()).toBe(beforeView);
  await page.evaluate(() => {
    delete (document as any).hidden;
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await activate(selected);
  await chooseView(page, "table", t);
  expect(await save()).toBe(beforeView);
  const draw = page.locator(".primary-actions > button").first();
  const end = page.locator(".primary-actions > button").last();
  await activate(draw);
  await expect(draw).toHaveText(t("Opponent turn"));
  await expect(draw).toBeDisabled();
  await expect(end).toHaveText(t("Please wait"));
  await expect(end).toBeDisabled();
  const width = page.viewportSize()!.width;
  for (const button of [draw, end]) {
    const r = (await button.boundingBox())!;
    const paint = await button.evaluate(el => {
      const style = getComputedStyle(el);
      return { text: style.color, background: style.backgroundColor, opacity: style.opacity };
    });
    const light = (value: string) => {
      const values = value.match(/[0-9.]+/g)!.slice(0, 3).map(Number).map(n => n / 255)
        .map(n => n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4);
      return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
    };
    const a = light(paint.text), b = light(paint.background);
    expect(paint.opacity).toBe("1");
    expect((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toBeGreaterThanOrEqual(4.5);
    expect(r.height).toBeGreaterThanOrEqual(locale === "zh-CN" ? 48 : 44);
    expect(r.y).toBeGreaterThanOrEqual(0);
    expect(r.y + r.height).toBeLessThanOrEqual(await page.evaluate(() => innerHeight));
  }
  const visibleTable = await page.locator(".table").evaluate(el => {
    const r = el.getBoundingClientRect();
    return Math.min(innerHeight, r.bottom) - Math.max(0, r.top);
  });
  await emitVisual(page, info, locale, "opponent-turn");
  const layout = await page.evaluate(() => Object.fromEntries(
    [".table-tools", ".table", ".status-line", ".player-dock", ".rack", ".rack-tiles", ".turn-tools", ".primary-actions", ".game-notice"].map(selector => {
      const el = document.querySelector(selector), r = el?.getBoundingClientRect();
      const style = el ? getComputedStyle(el) : null;
      return [selector, { rect: r?.toJSON(), font: style?.fontSize, padding: style?.padding, margin: style?.margin, overflow: style?.overflow, text: el?.textContent?.slice(0, 120) }];
    }),
  ));
  expect(visibleTable, JSON.stringify(layout)).toBeGreaterThanOrEqual(width < 720 ? 300 : 450);
  await expect(draw).toBeEnabled({ timeout: 15000 });
  await expect(draw).toContainText(t("Draw a tile"));
  await expect.poll(async () => JSON.parse((await save())!).current).toBe(0);
  expect(validSave(JSON.parse((await save())!))).toBe(true);
  expect((await new AxeBuilder({ page }).include(".game").analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
}
