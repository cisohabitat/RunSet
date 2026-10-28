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
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";
export async function verifyMenuClarity(
  page: Page,
  context: BrowserContext,
  info: TestInfo,
  locale: "en" | "zh-CN",
  offline: boolean,
) {
  const t = locale === "en" ? (s: string) => s : translator(messages),
    original = landscapePosition();
  original.coach = false;
  original.deadline = Date.now() + 120000;
  const game = reducer(original, { type: "move", ids: [3, 4], target: "new" }),
    raw = JSON.stringify(game),
    errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({
    reducedMotion: "reduce",
    colorScheme: locale === "en" ? "light" : "dark",
  });
  await page.addInitScript(
    ({ raw, locale }) => {
      if (sessionStorage.getItem("menu-clarity-seed")) return;
      sessionStorage.setItem("menu-clarity-seed", "1");
      localStorage.setItem("runset.save.v1", raw);
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.reading", String(locale === "zh-CN"));
      localStorage.setItem("runset.tableExpanded", "false");
      localStorage.setItem("runset.simpleHome", "false");
    },
    { raw, locale },
  );
  const b = (s: string) =>
    page.getByRole("button", { name: t(s), exact: true });
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
  await page.goto("/");
  if (offline) {
    await expect(
      page.getByRole("status").filter({ hasText: t("Ready offline") }),
    ).toBeVisible();
    await context.setOffline(true);
  }
  await expect(b("How to play →")).toHaveCount(1);
  await activate(b("How to play →"));
  await expect(page.locator(".guide")).toBeVisible();
  await expect(b("How to play →")).toHaveCount(0);
  await activate(b("← Back"));
  await activate(
    page
      .locator(".site-header")
      .getByRole("button", { name: t("Settings"), exact: true }),
  );
  const settings = page.getByRole("dialog", {
    name: t("Settings"),
    exact: true,
  });
  await settings.getByLabel(t("Simple home screen"), { exact: true }).check();
  await page.keyboard.press("Escape");
  await expect(page.locator(".simple-home")).toBeVisible();
  await expect(page.locator(".resume-context")).toBeVisible();
  await activate(page.locator(".simple-options > summary"));
  await expect(b("How to play →")).toHaveCount(1);
  await activate(b("How to play →"));
  await expect(page.locator(".guide")).toBeVisible();
  await activate(b("← Back"));
  await activate(b("Continue game →"));
  await expect(page.locator('.table [data-tile-id="3"]')).toBeVisible();
  const open = () => activate(page.getByLabel(t("Game menu"), { exact: true }));
  await open();
  const menu = page.getByRole("navigation", {
    name: t("Game options"),
    exact: true,
  });
  await expect(menu.locator(":scope > button").first()).toHaveText(
    t("Practice · keep this game"),
  );
  await expect(menu.locator(":scope > button").last()).toHaveText(
    t("Delete saved game"),
  );
  await activate(
    menu.getByRole("button", { name: t("Restart game"), exact: true }),
  );
  const confirm = page.getByRole("dialog");
  await expect(confirm).toBeVisible();
  await activate(
    confirm.getByRole("button", { name: t("Keep game"), exact: true }),
  );
  expect(await save()).toBe(raw);
  await open();
  await activate(
    menu.getByRole("button", { name: t("Delete saved game"), exact: true }),
  );
  await activate(
    confirm.getByRole("button", { name: t("Keep game"), exact: true }),
  );
  expect(await save()).toBe(raw);
  await open();
  await activate(
    menu.getByRole("button", { name: t("Settings"), exact: true }),
  );
  await expect(settings).toBeVisible();
  await page.keyboard.press("Escape");
  await open();
  await expect(menu.locator(":scope > button").first()).toBeInViewport();
  for (const control of await menu.getByRole("button").all()) {
    const size = await control.evaluate((el) => {
      // The visible label forwards clicks across the complete file control;
      // its transparent native input covers only the area inside the border.
      const target =
        el instanceof HTMLInputElement && el.type === "file"
          ? (el.closest(".file-button") ?? el)
          : el;
      return {
        name: target.textContent,
        height: target.getBoundingClientRect().height,
        font: parseFloat(getComputedStyle(target).fontSize),
      };
    });
    expect(size.height, JSON.stringify(size)).toBeGreaterThanOrEqual(48);
    expect(size.font, JSON.stringify(size)).toBeGreaterThanOrEqual(
      locale === "zh-CN" ? 18 : 16,
    );
  }
  const explanation = menu.locator(".backup-help > summary");
  await explanation.evaluate((el) => el.scrollIntoView({ block: "start" }));
  const scroll = await menu.evaluate((el) => el.scrollTop);
  expect(scroll).toBeGreaterThan(0);
  await activate(explanation);
  await expect(menu.locator(".backup-help")).toHaveAttribute("open", "");
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => requestAnimationFrame(() => resolve())),
  );
  expect(await menu.evaluate((el) => el.scrollTop)).toBe(scroll);
  expect(
    (await new AxeBuilder({ page }).include(".game-menu-content").analyze())
      .violations,
  ).toEqual([]);
  await page.screenshot({
    path: `/tmp/runset-menu-clarity-${info.project.name || "chromium"}-${locale}.png`,
  });
  await activate(b("Practice · keep this game"));
  await expect(
    page.getByRole("region", { name: t("Guided practice"), exact: true }),
  ).toBeVisible();
  expect(await save()).toBe(raw);
  await activate(b("Home"));
  await activate(b("Continue game →"));
  await expect(page.locator('.table [data-tile-id="3"]')).toBeVisible();
  expect(await save()).toBe(raw);
  await page.reload();
  await activate(b("Continue game →"));
  await expect(page.locator('.table [data-tile-id="3"]')).toBeVisible();
  expect(await save()).toBe(raw);
  expect(errors).toEqual([]);
}
