import {
  expect,
  type Page,
  type BrowserContext,
  type TestInfo,
  type Locator,
} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { stressPosition } from "./stress";
import { chooseView } from "./view";
import { validSave } from "../../src/lib/storage";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";
export async function verifyTableOverview(
  { page, context }: { page: Page; context: BrowserContext },
  info: TestInfo,
  locale: "en" | "zh-CN",
  offline = true,
) {
  const t = locale === "en" ? (s: string) => s : translator(messages),
    game = stressPosition(),
    now = Date.now();
  game.table = game.table.flatMap((m) => {
    const groups = [];
    for (let at = 0; at < m.tiles.length; ) {
      const count = m.tiles.length - at <= 5 ? m.tiles.length - at : 3;
      groups.push({
        id: `${m.id}-${at}`,
        tiles: m.tiles.slice(at, at + count),
      });
      at += count;
    }
    return groups;
  });
  game.turnStart.table = structuredClone(game.table);
  game.history = Array.from({ length: 100 }, () =>
    structuredClone(game.turnStart),
  );
  game.turnSeconds = 120;
  game.deadline = now + 120000;
  expect(game.table).toHaveLength(15);
  expect(validSave(game)).toBe(true);
  await page.clock.install({ time: now });
  await page.emulateMedia({
    colorScheme: locale === "en" ? "light" : "dark",
    reducedMotion: "reduce",
  });
  await page.addInitScript(
    ({ game, locale }) => {
      if (sessionStorage.getItem("overview-seeded")) return;
      sessionStorage.setItem("overview-seeded", "1");
      localStorage.setItem("runset.save.v1", JSON.stringify(game));
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.reading", String(locale === "zh-CN"));
    },
    { game, locale },
  );
  const activate = async (el: Locator) => {
    await el.scrollIntoViewIfNeeded();
    expect(
      await el.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return el.contains(
          document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
        );
      }),
    ).toBe(true);
    if (info.project.name === "firefox-desktop") await el.click();
    else await el.tap();
  };
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const save = () =>
    page.evaluate(() => localStorage.getItem("runset.save.v1"));
  await page.goto("/");
  if (offline) {
    await expect(
      page.getByRole("status").filter({ hasText: t("Ready offline") }),
    ).toBeVisible();
    await context.setOffline(true);
  }
  await activate(
    page.getByRole("button", { name: t("Continue game →"), exact: true }),
  );
  await expect(page.locator(".table .tile")).toHaveCount(50);
  await expect(page.locator(".rack .tile")).toHaveCount(50);
  await activate(page.locator('.rack [data-tile-id="13"]'));
  await activate(page.locator(".new-meld"));
  await expect
    .poll(async () => JSON.parse((await save())!).table.length)
    .toBe(16);
  for (const selector of [
    '.table [data-tile-id="0"]',
    '.rack [data-tile-id="14"]',
  ])
    await activate(page.locator(selector));
  await chooseView(page, "table", t);
  await expect(page.locator(".rack")).not.toBeVisible();
  const before = await save(),
    expanded = await page.locator(".table").boundingBox();
  expect(expanded!.height).toBeGreaterThanOrEqual(
    (await page.viewportSize())!.width < 720 ? 300 : 450,
  );
  const opener = page.getByRole("button", {
      name: t("Table overview"),
      exact: true,
    }),
    panel = page.getByRole("dialog", {
      name: t("Table overview"),
      exact: true,
    });
  const open = async () => {
    await activate(page.locator(".more-actions > summary"));
    await activate(opener);
    await expect(panel).toBeVisible();
  };
  await open();
  await expect(panel.locator("ol > li")).toHaveCount(16);
  await expect(panel.locator("li").first()).toContainText("1–3");
  await expect(panel.locator("li").first()).toContainText(t("6 pts"));
  if (locale === "zh-CN")
    await expect(panel.locator("li").first()).not.toContainText(/[A-Za-z]/);
  const last = panel.locator("li").last();
  await expect(last).toContainText(t("Needs fixing"));
  const done = panel.getByRole("button", {
    name: t("Back to table"),
    exact: true,
  });
  const r = (await done.boundingBox())!;
  expect(r.height).toBeGreaterThanOrEqual(48);
  expect(r.y + r.height).toBeLessThanOrEqual(
    await page.evaluate(() => innerHeight),
  );
  expect(
    (await new AxeBuilder({ page }).include(".table-overview").analyze())
      .violations,
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(panel).not.toBeVisible();
  await expect(opener).toBeFocused();
  expect(await save()).toBe(before);
  await activate(opener);
  const jump = last.getByRole("button", {
    name: new RegExp(t("Find group/run 16")),
  });
  await jump.scrollIntoViewIfNeeded();
  expect((await jump.boundingBox())!.height).toBeGreaterThanOrEqual(48);
  await page.screenshot({
    path: `/tmp/runset-table-overview-${info.project.name}-${locale}.png`,
  });
  await activate(jump);
  await expect(panel).not.toBeVisible();
  const target = page.locator('.table [data-tile-id="13"]');
  await expect(target).toBeFocused();
  expect(
    await target.evaluate((el) => {
      const r = el.getBoundingClientRect(),
        table = el.closest(".table")!.getBoundingClientRect();
      return (
        r.top >= Math.max(0, table.top) &&
        r.bottom <= Math.min(innerHeight, table.bottom) &&
        r.left >= Math.max(0, table.left) &&
        r.right <= Math.min(innerWidth, table.right)
      );
    }),
  ).toBe(true);
  await expect(target).not.toHaveAttribute("aria-pressed", "true");
  for (const id of [0, 14])
    await expect(
      page.locator(`.game .tile[data-tile-id="${id}"]`),
    ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".rack")).not.toBeVisible();
  expect(await save()).toBe(before);
  const after = JSON.parse(before!);
  expect(after.history).toHaveLength(100);
  expect(after.deadline).toBe(game.deadline);
  expect(validSave(after)).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  if (locale === "en") {
    await open();
    await page.clock.fastForward(120001);
    await expect(panel).not.toBeVisible();
    await expect
      .poll(async () => JSON.parse((await save())!).turn)
      .toBeGreaterThan(game.turn);
    expect(validSave(JSON.parse((await save())!))).toBe(true);
  }
  expect(errors).toEqual([]);
}
