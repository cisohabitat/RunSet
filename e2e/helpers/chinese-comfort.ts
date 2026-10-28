import {
  expect,
  type Page,
  type BrowserContext,
  type TestInfo,
  type Locator,
} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { landscapePosition } from "./landscape";
import { exportBackup } from "../../src/lib/backup";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";
export async function verifyChineseComfort(
  page: Page,
  context: BrowserContext,
  info: TestInfo,
  locale: "en" | "zh-CN",
  offline: boolean,
) {
  const zh = translator(messages),
    t = locale === "en" ? (s: string) => s : zh,
    now = 1793188800000,
    game = landscapePosition();
  game.coach = false;
  game.players[0].name = "constructor";
  game.players[1].name = "Pass";
  game.deadline = now + 120000;
  await page.clock.install({ time: now });
  await page.clock.setFixedTime(now);
  await page.emulateMedia({
    reducedMotion: "reduce",
    colorScheme: locale === "en" ? "light" : "dark",
  });
  await page.addInitScript(
    ({ game, locale }) => {
      if (sessionStorage.getItem("chinese-comfort-seed")) return;
      sessionStorage.setItem("chinese-comfort-seed", "1");
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
    save = () => page.evaluate(() => localStorage.getItem("runset.save.v1")),
    language = page.getByRole("combobox", {
      name: "语言 / Language",
      exact: true,
    });
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
  await page.goto("/");
  if (offline) {
    await expect(
      page.getByRole("status").filter({ hasText: t("Ready offline") }),
    ).toBeVisible();
    await context.setOffline(true);
  }
  await activate(b("Continue game →"));
  await activate(page.locator('.rack [data-tile-id="3"]'));
  const old = await save();
  await language.selectOption(locale === "en" ? "zh-CN" : "en");
  await expect(page.locator(".opponents")).toContainText("Pass");
  await language.selectOption(locale);
  await expect(page.locator('.rack [data-tile-id="3"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(await save()).toBe(old);
  await activate(b("Home"));
  await activate(b("New game →"));
  await page
    .getByLabel(t("What should we call you?"), { exact: true })
    .fill("red 7");
  await activate(page.locator(".setup-options > summary"));
  await activate(page.locator(".setup .choices button").nth(2));
  await page
    .getByRole("checkbox", { name: t("Show first-game guidance"), exact: true })
    .uncheck();
  await activate(page.locator(".setup form > .primary"));
  const confirm = page.getByRole("dialog");
  await activate(
    confirm.getByRole("button", { name: t("Keep game"), exact: true }),
  );
  expect(await save()).toBe(old);
  await activate(page.locator(".setup form > .primary"));
  await activate(
    confirm.getByRole("button", { name: t("Start new game"), exact: true }),
  );
  await expect(page.locator("main.game")).toBeVisible();
  await expect
    .poll(async () => JSON.parse((await save())!).players.length)
    .toBe(4);
  const fresh = await save(),
    parsed = JSON.parse(fresh!),
    names = parsed.players
      .filter((p: { bot: string | null }) => p.bot)
      .map((p: { name: string }) => p.name);
  expect([...names].sort()).toEqual(
    (locale === "zh-CN"
      ? ["电脑阿明", "电脑小兰", "电脑老陈"]
      : ["Juniper", "Atlas", "Cleo"]
    ).sort(),
  );
  expect(parsed.players.find((p: { bot: string | null }) => !p.bot).name).toBe(
    "red 7",
  );
  for (const name of names)
    await expect(page.locator(".opponents")).toContainText(name);
  expect(parsed.players[parsed.current].bot).not.toBeNull();
  const rack = page.locator(".rack-tiles");
  await expect(rack).toHaveAttribute("tabindex", "0");
  await rack.focus();
  await expect(rack).toBeFocused();
  if (await rack.evaluate((el) => el.scrollWidth > el.clientWidth)) {
    await rack.evaluate((el) => {
      el.scrollLeft = 0;
    });
    await page.keyboard.press("ArrowRight");
    await page.clock.runFor(300);
    await expect
      .poll(() => rack.evaluate((el) => el.scrollLeft))
      .toBeGreaterThan(0);
  }
  expect(await save()).toBe(fresh);
  expect(
    (await new AxeBuilder({ page }).include("main.game").analyze()).violations,
  ).toEqual([]);
  await page.screenshot({
    path: `/tmp/runset-chinese-comfort-${info.project.name || "chromium"}-${locale}.png`,
  });
  await language.selectOption(locale === "en" ? "zh-CN" : "en");
  for (const name of names)
    await expect(page.locator(".opponents")).toContainText(name);
  expect(await save()).toBe(fresh);
  await language.selectOption(locale);
  await page.clock.setFixedTime(now + 100);
  await activate(page.locator(".game-dropdown > summary"));
  await activate(b("Restart game"));
  await activate(
    confirm.getByRole("button", { name: t("Start new game"), exact: true }),
  );
  await expect
    .poll(async () => JSON.parse((await save())!).seed)
    .not.toBe(parsed.seed);
  const replay = JSON.parse((await save())!);
  expect(
    replay.players
      .filter((p: { bot: string | null }) => p.bot)
      .map((p: { name: string }) => p.name)
      .sort(),
  ).toEqual([...names].sort());
  expect(replay.players.find((p: { bot: string | null }) => !p.bot).name).toBe(
    "red 7",
  );
  await activate(b("Home"));
  await page.locator('.save-tools input[type="file"]').setInputFiles({
    name: "old-game.json",
    mimeType: "application/json",
    buffer: Buffer.from(exportBackup(game)),
  });
  await activate(
    confirm.getByRole("button", { name: t("Restore backup"), exact: true }),
  );
  await expect(page.locator("main.game")).toBeVisible();
  await expect.poll(save).toBe(old);
  await expect(page.locator(".opponents")).toContainText("Pass");
  expect(
    await page.evaluate(() => localStorage.getItem("runset.roundHistory.v1")),
  ).toBeNull();
  await page.reload();
  await activate(b("Continue game →"));
  await expect(page.locator(".opponents")).toContainText("Pass");
  expect(await save()).toBe(old);
  expect(errors).toEqual([]);
}
