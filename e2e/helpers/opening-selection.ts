import { expect, type Page, type TestInfo, type Locator, type BrowserContext } from "@playwright/test";
import { landscapePosition } from "./landscape";
import { reducer, turnCheck } from "../../src/engine/game";
import { validSave } from "../../src/lib/storage";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";

/** A crowded public table stays locked until the player's rack-only opening is accepted. */
export async function verifyOpeningSelection(page: Page, context: BrowserContext, info: TestInfo, locale: "en" | "zh-CN", offline: boolean) {
  const t = locale === "en" ? (s: string) => s : translator(messages);
  const game = landscapePosition(true), opening = [11, 37, 63];
  delete game.match;
  game.players[0].melded = false;
  for (const p of game.players) p.rack = p.rack.filter(id => !opening.includes(id));
  game.pool = game.pool.filter(id => !opening.includes(id));
  game.players[0].rack.push(...opening);
  game.turnStart.rack = [...game.players[0].rack];
  expect(validSave(game)).toBe(true);
  const now = Date.now();
  game.deadline = now + 120000;
  await page.clock.install({time: now});
  await page.clock.setFixedTime(now);
  await page.emulateMedia({reducedMotion:"reduce", colorScheme:locale === "en" ? "light" : "dark"});
  await page.addInitScript(({game, locale}) => {
    if (sessionStorage.getItem("opening-selection-seed")) return;
    sessionStorage.setItem("opening-selection-seed", "1");
    localStorage.setItem("runset.save.v1", JSON.stringify(game));
    localStorage.setItem("runset.language", locale);
    localStorage.setItem("runset.reading", String(locale === "zh-CN"));
    localStorage.setItem("runset.pace", "5000");
    localStorage.setItem("runset.muted", "true");
  }, {game, locale});
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  const b = (name: string) => page.getByRole("button", {name:t(name), exact:true});
  const bytes = () => page.evaluate(() => localStorage.getItem("runset.save.v1"));
  const activate = async (el: Locator) => {
    await el.scrollIntoViewIfNeeded();
    expect(await el.evaluate(el => {
      const r = el.getBoundingClientRect();
      return r.width >= 44 && r.height >= 44 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth && el.contains(document.elementFromPoint(r.x + r.width/2, r.y + r.height/2));
    })).toBe(true);
    if (info.project.name === "firefox-desktop") await el.click(); else await el.tap();
  };
  await page.goto("/");
  if (offline) {
    await expect(page.getByRole("status").filter({hasText:t("Ready offline")})).toBeVisible();
    await context.setOffline(true);
    await page.reload();
  }
  await activate(b("Continue game →"));
  await expect(page.locator(".save-indicator")).toHaveText(t("Saved"));
  const initial = await bytes();
  const status = page.locator(".status-line");
  const guide = page.locator(".first-game-guide p");
  const checkGuidance = async (ready: boolean) => {
    await expect(status).toHaveAttribute("data-turn-state", "selected");
    await expect(status).toContainText(t("Open with rack tiles"));
    const compact = page.locator(".guide-compact");
    await expect(compact).toHaveText(t(ready
      ? "Clear selection, then End turn. Table tiles unlock after your opening."
      : "Clear selection. Open with rack tiles before using table tiles."));
    await expect(page.locator(".guide-full")).toHaveText(t(ready
      ? "Clear selection, then End turn. Table tiles unlock after your opening."
      : "Table tiles unlock after your opening. Clear selection, then finish your opening with rack tiles and End turn."));
    await guide.scrollIntoViewIfNeeded();
    expect(await guide.evaluate(el => {
      const text = Array.from(el.children).find(child => getComputedStyle(child).display !== "none")!;
      const r = text.getBoundingClientRect(), c = el.closest(".game-context")!.getBoundingClientRect();
      return r.top >= Math.max(0,c.top) && r.bottom <= Math.min(innerHeight,c.bottom) && r.left >= 0 && r.right <= innerWidth && document.documentElement.scrollWidth <= innerWidth;
    })).toBe(true);
    if (locale === "zh-CN") expect(await guide.innerText()).not.toMatch(/[a-z]/i);
    expect(await page.locator('[data-suggested-destination="true"]').count()).toBe(0);
  };
  const original = page.viewportSize()!;
  // Review the phone/tablet profile and a mouse-sized desktop without remounting.
  for (const viewport of [original, {width:1440,height:900}]) {
    await page.setViewportSize(viewport);
    await activate(page.locator('.meld-tiles [data-tile-id="0"]'));
    await checkGuidance(false);
    expect(await bytes()).toBe(initial);
    await activate(page.locator('.rack [data-tile-id="11"]'));
    await checkGuidance(false);
    expect(await bytes()).toBe(initial);
    await page.screenshot({path:`/tmp/runset-opening-selection-${info.project.name || "chromium"}-${locale}-${viewport.width}.png`});
    await activate(b("Deselect all"));
    await expect(status).toHaveAttribute("data-turn-state", "start");
    expect(await bytes()).toBe(initial);
  }
  await page.setViewportSize(original);
  for (const id of opening) await activate(page.locator(`.rack [data-tile-id="${id}"]`));
  await activate(page.locator("main.game .new-meld"));
  const expected = reducer(game, {type:"move", ids:opening, target:"new"});
  expect(turnCheck(expected).valid).toBe(true);
  await expect.poll(async () => JSON.parse((await bytes())!)).toEqual(expected);
  await expect(page.locator(".save-indicator")).toHaveText(t("Saved"));
  const readyBytes = await bytes();
  await activate(page.locator('.meld-tiles [data-tile-id="0"]'));
  await checkGuidance(true);
  expect(await bytes()).toBe(readyBytes);
  await page.locator('.meld-tiles [data-tile-id="0"]').focus();
  await page.keyboard.press("Escape");
  await expect(status).toHaveAttribute("data-turn-state", "ready");
  expect(await bytes()).toBe(readyBytes);
  // A tile placed from this rack is still editable; it is not a locked public tile.
  await activate(page.locator('.meld-tiles [data-tile-id="11"]'));
  await expect(status).toContainText(t("Choose where to place"));
  await expect(guide).not.toContainText(t("Table tiles unlock after your opening. Clear selection, then finish your opening with rack tiles and End turn."));
  await activate(b("Deselect all"));
  expect(await bytes()).toBe(readyBytes);
  await activate(page.locator(".primary-actions > button.primary"));
  await expect.poll(async () => JSON.parse((await bytes())!).turn).toBe(2);
  const accepted = JSON.parse((await bytes())!);
  expect(accepted.players[0].melded).toBe(true);
  expect(accepted.table).toEqual(expected.table);
  expect(accepted.players[0].rack).toEqual(expected.players[0].rack);
  expect(validSave(accepted)).toBe(true);
  expect(errors).toEqual([]);
}
