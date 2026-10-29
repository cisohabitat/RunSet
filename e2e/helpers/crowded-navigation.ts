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
import { reducer, turnCheck, type GameState } from "../../src/engine/game";
import { validSave } from "../../src/lib/storage";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";

export async function verifyCrowdedNavigation(
  page: Page,
  context: BrowserContext,
  info: TestInfo,
  locale: "en" | "zh-CN",
  offline: boolean,
) {
  const t = locale === "en" ? (s: string) => s : translator(messages);
  const initial = stressPosition(),
    now = Date.now();
  initial.table = initial.table.flatMap((m) => {
    const groups = [];
    for (let at = 0; at < m.tiles.length; ) {
      const size = m.tiles.length - at <= 5 ? m.tiles.length - at : 3;
      groups.push({ id: `${m.id}-${at}`, tiles: m.tiles.slice(at, at + size) });
      at += size;
    }
    return groups;
  });
  initial.lastPlaced = [1];
  initial.turnStart.table = structuredClone(initial.table);
  initial.history = Array.from({ length: 100 }, () =>
    structuredClone(initial.turnStart),
  );
  if (locale === "en") {
    initial.turnSeconds = 120;
    initial.deadline = now + 120000;
    await page.clock.install({ time: now });
  }
  expect(initial.table).toHaveLength(15);
  expect(validSave(initial)).toBe(true);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({
    reducedMotion: "reduce",
    colorScheme: locale === "en" ? "light" : "dark",
  });
  await page.addInitScript(
    ({ initial, locale }) => {
      if (sessionStorage.getItem("crowded-navigation")) return;
      sessionStorage.setItem("crowded-navigation", "1");
      localStorage.setItem("runset.save.v1", JSON.stringify(initial));
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.reading", String(locale === "zh-CN"));
      localStorage.setItem("runset.pace", "5000");
      localStorage.setItem("runset.muted", "true");
    },
    { initial, locale },
  );
  const bytes = () =>
    page.evaluate(() => localStorage.getItem("runset.save.v1"));
  const state = async (): Promise<GameState> => JSON.parse((await bytes())!);
  const b = (s: string) =>
    page.getByRole("button", { name: t(s), exact: true });
  const activate = async (el: Locator) => {
    await el.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        el.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return (
            r.width >= 44 &&
            r.height >= 44 &&
            r.left >= 0 &&
            r.right <= innerWidth &&
            r.top >= 0 &&
            r.bottom <= innerHeight &&
            el.contains(
              document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
            )
          );
        }),
      )
      .toBe(true);
    if (info.project.name === "firefox-desktop") await el.click();
    else await el.tap();
  };
  const visibleFocus = async (tile: Locator) => {
    await expect(tile).toBeFocused();
    await expect
      .poll(() =>
        tile.evaluate((el) => {
          const r = el.getBoundingClientRect(),
            region = el.closest(".rack-tiles,.table")!.getBoundingClientRect();
          return (
            r.width >= 44 &&
            r.height >= 44 &&
            r.top >= Math.max(0, region.top) &&
            r.bottom <= Math.min(innerHeight, region.bottom) &&
            r.left >= Math.max(0, region.left) &&
            r.right <= Math.min(innerWidth, region.right) &&
            el.contains(
              document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
            )
          );
        }),
      )
      .toBe(true);
  };
  const check = (s: GameState) => {
    expect(validSave(s)).toBe(true);
    const ids = [
      ...s.pool,
      ...s.players.flatMap((p) => p.rack),
      ...s.table.flatMap((m) => m.tiles),
    ];
    expect(ids).toHaveLength(106);
    expect(new Set(ids).size).toBe(106);
    expect(s.deadline).toBe(initial.deadline);
  };
  const menu = async () => {
    const more = page.locator(".more-actions");
    if (!(await more.evaluate((el: HTMLDetailsElement) => el.open)))
      await activate(more.locator(":scope > summary"));
  };
  const find = async (label: string) => {
    await menu();
    await activate(b(label));
  };
  await page.goto("/");
  if (offline) {
    await expect(
      page.getByRole("status").filter({ hasText: t("Ready offline") }),
    ).toBeVisible();
    await context.setOffline(true);
    await page.reload();
  }
  await activate(b("Continue game →"));
  await expect(page.locator("main.game .table .meld-index")).toHaveCount(15);
  for (let i = 0; i < 15; i++)
    await expect(
      page.locator("main.game .table .meld-index").nth(i),
    ).toHaveText(`${i + 1} ·`);
  const before = await bytes();
  await chooseView(page, "wide", t);
  const first = page.locator('.rack [data-tile-id="13"]'),
    last = page.locator('.rack [data-tile-id="99"]');
  await activate(first);
  await first.focus();
  await page.keyboard.press("End");
  await visibleFocus(last);
  await page.keyboard.press("ArrowRight");
  await visibleFocus(first);
  await page.keyboard.press("ArrowLeft");
  await visibleFocus(last);
  await page.keyboard.press("Home");
  await visibleFocus(first);
  await activate(b("Deselect all"));
  expect(await bytes()).toBe(before);
  const selected = page.locator('.rack [data-tile-id="89"]');
  await activate(selected);
  await chooseView(page, "table", t);
  await expect(page.locator(".rack")).not.toBeVisible();
  expect(
    (await page.locator(".table").boundingBox())!.height,
  ).toBeGreaterThanOrEqual(page.viewportSize()!.width < 720 ? 300 : 450);
  await find("Find selected tiles");
  await visibleFocus(selected);
  expect(await bytes()).toBe(before);
  await chooseView(page, "table", t);
  await find("Table overview");
  const dialog = page.getByRole("dialog", {
    name: t("Table overview"),
    exact: true,
  });
  await activate(
    dialog.getByRole("button", { name: new RegExp(t("Find group/run 15")) }),
  );
  await visibleFocus(page.locator('.table [data-tile-id="84"]'));
  expect(await bytes()).toBe(before);
  await expect(
    page.locator('.table [data-meld-index="15"] .meld-index'),
  ).toHaveText("15 ·");
  await activate(b("Add selected tiles to meld 15"));
  const moved = reducer(initial, {
    type: "move",
    ids: [89],
    target: initial.table[14].id,
  });
  await expect.poll(state).toEqual(moved);
  check(await state());
  expect(turnCheck(moved).valid).toBe(true);
  expect(moved.history).toHaveLength(100);
  await find("Find latest placement");
  await visibleFocus(page.locator('.table [data-tile-id="89"]'));
  const edited = await bytes();
  await expect(
    page.locator('.table [data-tile-id="1"] .tile-recent'),
  ).toBeVisible();
  await expect(page.locator('.table [data-tile-id="1"]')).toHaveAttribute(
    "aria-description",
    t("Played in the latest turn."),
  );
  expect(await bytes()).toBe(edited);
  await page.screenshot({
    path: `/tmp/runset-crowded-${info.project.name || "chromium"}-${locale}.png`,
  });
  await activate(b("Undo move"));
  const undone = reducer(moved, { type: "undo" });
  await expect.poll(state).toEqual(undone);
  check(await state());
  await find("Find latest placement");
  await visibleFocus(page.locator('.table [data-tile-id="1"]'));
  const saved = await bytes();
  await page.reload();
  await activate(b("Continue game →"));
  expect(await bytes()).toBe(saved);
  check(await state());
  await expect(page.locator("main.game .table .meld-index")).toHaveCount(15);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  if (locale === "en") {
    await page.clock.fastForward(120001);
    await expect.poll(async () => (await state()).turn).toBe(initial.turn + 1);
    const expired = await state();
    expect(expired.table).toEqual(initial.table);
    expect(expired.players[0].rack).toEqual(initial.players[0].rack);
    expect(expired.history).toEqual([]);
    expect(validSave(expired)).toBe(true);
  }
  expect(errors).toEqual([]);
}
