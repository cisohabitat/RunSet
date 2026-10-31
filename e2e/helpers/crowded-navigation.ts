import { verifyTileMarkings } from "./tile-markings";
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
    if (info.project.name === "firefox-desktop" || page.viewportSize()?.width === 1440) await el.click();
    else await el.tap();
  };
  const visibleFocus = async (tile: Locator, requireFocus = true) => {
    if (requireFocus) await expect(tile).toBeFocused();
    const measure = () => tile.evaluate((el) => {
      const r = el.getBoundingClientRect(),
        owner = el.closest<HTMLElement>(".rack-tiles,.table")!,
        region = owner.getBoundingClientRect(),
        border = getComputedStyle(owner),
        style = getComputedStyle(el),
        ring = Math.max(0, parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset)),
        top = region.top + parseFloat(border.borderTopWidth),
        left = region.left + parseFloat(border.borderLeftWidth),
        scrollbarX = Math.max(0, owner.offsetWidth - owner.clientWidth - parseFloat(border.borderLeftWidth) - parseFloat(border.borderRightWidth)),
        scrollbarY = Math.max(0, owner.offsetHeight - owner.clientHeight - parseFloat(border.borderTopWidth) - parseFloat(border.borderBottomWidth)),
        bottom = region.bottom - parseFloat(border.borderBottomWidth) - scrollbarY,
        right = region.right - parseFloat(border.borderRightWidth) - scrollbarX;
      return {
        valid: r.width >= 44 && r.height >= 44 && style.outlineStyle !== "none" &&
          parseFloat(style.outlineWidth) >= 2 &&
          r.top - ring >= Math.max(0, top) && r.bottom + ring <= Math.min(innerHeight, bottom) &&
          r.left - ring >= Math.max(0, left) && r.right + ring <= Math.min(innerWidth, right) &&
          el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)),
        tile: el.getAttribute("data-tile-id"), rect: r.toJSON(), clip: {top,left,bottom,right},
        outline: {width:style.outlineWidth,offset:style.outlineOffset,style:style.outlineStyle},
      };
    });
    try { await expect.poll(async () => (await measure()).valid).toBe(true); }
    catch(error) { console.log("CROWDED_FOCUS_GEOMETRY " + JSON.stringify(await measure())); throw error; }
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
  const profile = page.viewportSize()!;
  const viewports = [profile, {width:1180,height:820}, {width:1440,height:900}]
    .filter((size,index,all) => all.findIndex(other => other.width === size.width && other.height === size.height) === index);
  for (const size of viewports) {
    await page.setViewportSize(size);
    const target = page.locator('.table [data-tile-id="84"]');
    const dimensions = await target.evaluate(el => {
      const style=getComputedStyle(el); return {width:style.width,height:style.height};
    });
    const tableHeight = await page.locator("main.game > .table").evaluate(el => getComputedStyle(el).height);
    await find("Table overview");
    await activate(page.getByRole("dialog").getByRole("button", {name:new RegExp(t("Find group/run 15"))}));
    await visibleFocus(target);
    expect(await target.evaluate(el => {const style=getComputedStyle(el);return {width:style.width,height:style.height};})).toEqual(dimensions);
    expect(await page.locator("main.game > .table").evaluate(el => getComputedStyle(el).height)).toBe(tableHeight);
    expect(await bytes()).toBe(before);
    await page.screenshot({path:`/tmp/runset-crowded-focus-${info.project.name||"chromium"}-${locale}-${size.width}.png`});
  }
  await page.setViewportSize(profile);
  await chooseView(page, "wide", t);
  const first = page.locator('.rack [data-tile-id="13"]'),
    last = page.locator('.rack [data-tile-id="99"]');
  await activate(first);
  await first.focus();
  await page.keyboard.press("End");
  await visibleFocus(last);
  await page.keyboard.press("ArrowRight");
  await visibleFocus(first);
  await expect(first).toHaveAttribute("aria-pressed", "true");
  await expect(first.locator(".tile-check")).toBeVisible();
  await page.screenshot({path:`/tmp/runset-crowded-selected-${info.project.name||"chromium"}-${locale}.png`});
  await page.keyboard.press("ArrowRight");
  await visibleFocus(page.locator('.rack [data-tile-id="14"]'));
  await visibleFocus(first, false);
  await expect(first).toHaveAttribute("aria-pressed", "true");
  await page.keyboard.press("ArrowLeft");
  await visibleFocus(first);
  await page.keyboard.press("ArrowLeft");
  await visibleFocus(last);
  await page.keyboard.press("Home");
  await visibleFocus(first);
  await activate(b("Deselect all"));
  await expect(first).toHaveAttribute("aria-pressed", "false");
  await expect(first.locator(".tile-check")).toHaveCount(0);
  expect(await bytes()).toBe(before);
  const selected = page.locator('.rack [data-tile-id="89"]');
  await activate(selected);
  await menu();
  await verifyTileMarkings(page, t, activate);
  await activate(page.locator(".more-actions > summary"));
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
  // Rejected public-tile returns keep the selection and latest-play meaning.
  const acceptedMarker = page.locator('.table [data-tile-id="1"]');
  await activate(acceptedMarker);
  await find("Return selected tiles to rack");
  const rejected = reducer(undone, {type:"move",ids:[1],target:"rack"});
  await expect.poll(state).toEqual(rejected);
  check(await state());
  const rejectedBytes = await bytes();
  await find("Find selected tiles");
  await visibleFocus(acceptedMarker);
  await expect(acceptedMarker).toHaveClass(/rejected/);
  await expect(acceptedMarker.locator(".tile-check")).toBeVisible();
  await expect(acceptedMarker.locator(".tile-recent")).toBeHidden();
  await page.keyboard.press("ArrowRight");
  await visibleFocus(page.locator('.table [data-tile-id="2"]'));
  await visibleFocus(acceptedMarker, false);
  await expect(acceptedMarker).toHaveCSS("outline-style", "dashed");
  await page.screenshot({path:`/tmp/runset-crowded-rejected-${info.project.name||"chromium"}-${locale}.png`});
  await activate(b("Deselect all"));
  await expect(acceptedMarker).toHaveAttribute("aria-pressed", "false");
  await expect(acceptedMarker.locator(".tile-check")).toHaveCount(0);
  await expect(acceptedMarker.locator(".tile-recent")).toBeVisible();
  expect(await bytes()).toBe(rejectedBytes);
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
