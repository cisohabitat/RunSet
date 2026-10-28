import {
  expect,
  type Page,
  type BrowserContext,
  type TestInfo,
} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { landscapePosition } from "./landscape";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";
export async function verifyVisualConsistency(
  page: Page,
  context: BrowserContext,
  info: TestInfo,
  locale: "en" | "zh-CN",
  offline: boolean,
) {
  const t = locale === "en" ? (s: string) => s : translator(messages),
    game = landscapePosition(false, 3);
  delete game.match;
  delete game.deadline;
  delete game.turnSeconds;
  game.coach = false;
  game.current = 1;
  game.players
    .filter((p) => p.bot)
    .forEach((p, i) => {
      p.name = ["电脑阿明", "电脑小兰", "电脑老陈"][i];
    });
  game.turnStart = {
    table: structuredClone(game.table),
    rack: [...game.players[1].rack],
  };
  await page.emulateMedia({
    reducedMotion: "reduce",
    colorScheme: locale === "en" ? "light" : "dark",
  });
  await page.addInitScript(
    ({ game, locale }) => {
      if (sessionStorage.getItem("visual-consistency-seed")) return;
      sessionStorage.setItem("visual-consistency-seed", "1");
      localStorage.setItem("runset.save.v1", JSON.stringify(game));
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.pace", "5000");
    },
    { game, locale },
  );
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const b = (s: string) =>
      page.getByRole("button", { name: t(s), exact: true }),
    save = () => page.evaluate(() => localStorage.getItem("runset.save.v1"));
  const shot = async (name: string) => {
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `/tmp/runset-polish-${info.project.name || "chromium"}-${locale}-${name}.png`,
    });
  };
  await page.goto("/");
  if (offline) {
    await expect(
      page.getByRole("status").filter({ hasText: t("Ready offline") }),
    ).toBeVisible();
    await context.setOffline(true);
  }
  const before = await save();
  await shot("home");
  await b("New game →").click();
  await expect(page.locator(".setup")).toBeVisible();
  await page.locator(".setup-options > summary").click();
  for (const select of await page.locator(".setup select").all())
    expect(
      await select.evaluate((el) => el.getBoundingClientRect().height),
    ).toBeGreaterThanOrEqual(48);
  await shot("setup");
  await b("← Back").click();
  await page.locator(".hero-actions > .text-button").first().click();
  await expect(page.locator(".guide")).toBeVisible();
  await shot("rules");
  await b("Home").click();
  await page
    .locator(".hero-actions button")
    .filter({ hasText: t("Learn to play").trim() })
    .click();
  await expect(page.locator(".practice-layout")).toBeVisible();
  await shot("learn");
  await b("Home").click();
  await page
    .locator(".hero-actions button")
    .filter({ hasText: t("Quick exercises") })
    .click();
  await expect(page.locator(".exercises")).toBeVisible();
  await shot("exercises");
  await b("Home").click();
  await b("Continue game →").click();
  await expect(page.locator("main.game")).toBeVisible();
  await shot("board");
  if (
    (page.viewportSize()?.width ?? 0) >= 960 &&
    info.project.name !== "firefox-desktop"
  ) {
    const lines = await page
      .locator(".opponent.is-turn > div > span")
      .evaluate((el) => {
        const r = document.createRange();
        r.selectNodeContents(el);
        return new Set(Array.from(r.getClientRects(), (r) => Math.round(r.top)))
          .size;
      });
    expect(lines).toBe(1);
  }
  await page
    .locator(".site-header")
    .getByRole("button", { name: t("Settings"), exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: t("Settings"), exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("select")).toHaveCount(2);
  for (const select of await dialog.locator("select").all()) {
    await select.scrollIntoViewIfNeeded();
    const r = await select.boundingBox();
    expect(r!.height).toBeGreaterThanOrEqual(48);
    expect(r!.x).toBeGreaterThanOrEqual(0);
    expect(r!.x + r!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  }
  await dialog
    .getByRole("combobox", { name: t("Opponent pace"), exact: true })
    .scrollIntoViewIfNeeded();
  await shot("settings");
  expect(
    (await new AxeBuilder({ page }).include(".settings-dialog").analyze())
      .violations,
  ).toEqual([]);
  await dialog
    .getByRole("button", { name: t("Done"), exact: true })
    .first()
    .click();
  await expect(
    page
      .locator(".site-header")
      .getByRole("button", { name: t("Settings"), exact: true }),
  ).toBeFocused();
  expect(await save()).toBe(before);
  expect(errors).toEqual([]);
}
