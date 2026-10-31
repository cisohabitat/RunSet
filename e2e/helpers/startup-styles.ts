import { expect, type Page, type TestInfo, type Locator } from "@playwright/test";
import { stressPosition } from "./stress";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";

/** Built assets: a slow stylesheet must retain the loading UI and existing save. */
export async function verifyStartupStyles(page: Page, info: TestInfo, locale: "en" | "zh-CN") {
  const t = locale === "en" ? (s: string) => s : translator(messages);
  const initial = JSON.stringify(stressPosition());
  await page.addInitScript(({initial,locale}) => {
    localStorage.setItem("runset.save.v1", initial);
    localStorage.setItem("runset.language", locale);
    localStorage.setItem("runset.muted", "true");
  }, {initial,locale});
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: locale === "en" ? "light" : "dark" });
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  const b = (name: string) => page.getByRole("button", {name:t(name),exact:true});
  const bytes = () => page.evaluate(() => localStorage.getItem("runset.save.v1"));
  const activate = async (el: Locator) => {
    await el.scrollIntoViewIfNeeded();
    await expect.poll(() => el.evaluate(el => {
      const r=el.getBoundingClientRect();
      return r.width>=44 && r.height>=44 && r.left>=0 && r.right<=innerWidth && r.top>=0 && r.bottom<=innerHeight && el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));
    })).toBe(true);
    if(info.project.name === "firefox-desktop") await el.click(); else await el.tap();
  };
  await page.goto("/");
  await expect(b("Continue game →")).toBeVisible();
  expect(await bytes()).toBe(initial);
  expect(await page.evaluate(() => Array.from(document.styleSheets).some(sheet => /\/(Settings|Setup|HowToPlay)-[^/]+\.css/.test(sheet.href??"")))).toBe(false);
  const delayed = async (name: string, open: () => Promise<void>, content: Locator, loading: Locator) => {
    const pattern = new RegExp(`/assets/${name}-[^/]+\\.css(?:\\?.*)?$`);
    let release!: () => void, requested = false;
    const gate = new Promise<void>(done => { release = done; });
    await page.route(pattern, async route => {requested=true;await gate;await route.continue();});
    try {
      await open();
      await expect.poll(() => requested).toBe(true);
      await expect(loading).toBeVisible();
      await expect(content).toHaveCount(0);
      expect(await bytes()).toBe(initial);
      release();
      await expect(content).toBeVisible();
      expect(await page.evaluate(name => Array.from(document.styleSheets).some(sheet => new RegExp(`/assets/${name}-[^/]+\\.css`).test(sheet.href??"")), name)).toBe(true);
      expect(await bytes()).toBe(initial);
    } finally {release();await page.unroute(pattern);}
  };
  const settings = page.locator(".settings-dialog");
  await delayed("Settings", () => activate(b("Settings")), settings,
    page.getByRole("status").filter({hasText:t("Loading settings…")}));
  await expect(settings).toHaveCSS("display", "flex");
  await expect(settings.locator(".settings-body")).toHaveCSS("overflow-y", "auto");
  await activate(settings.getByRole("button",{name:t("Done"),exact:true}).first());
  await expect(b("Settings")).toBeFocused();
  const setup=page.locator("main.setup");
  await delayed("Setup", () => activate(b("New game →")), setup, page.locator('main[aria-busy="true"]'));
  await activate(setup.locator(".setup-options > summary"));
  await expect(setup.locator(".choices")).toHaveCSS("display", "flex");
  await activate(b("← Back"));
  const guide=page.locator("main.guide");
  await delayed("HowToPlay", () => activate(page.locator(".hero-actions button").filter({hasText:t("How to play").trim()})), guide, page.locator('main[aria-busy="true"]'));
  await expect(guide.locator(".guide-grid")).toHaveCSS("display", "grid");
  await expect(guide.locator("article").first()).toHaveCSS("border-top-width", "1px");
  await activate(b("Home"));
  await expect(b("Continue game →")).toBeVisible();
  expect(await bytes()).toBe(initial);
  expect(errors).toEqual([]);
}
