import { expect, type Page, type BrowserContext, type TestInfo } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { stressPosition } from "./stress";
import { validSave } from "../../src/lib/storage";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";
export async function verifyLongSession(page: Page, context: BrowserContext, info: TestInfo, locale: "en" | "zh-CN") {
  const t = locale === "en" ? (s: string) => s : translator(messages), game = stressPosition(), now = Date.now();
  game.turnSeconds = 120;
  game.deadline = now + 120000;
  expect(validSave(game)).toBe(true);
  const id = game.players[0].rack[0], errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.clock.install({ time: now });
  await page.emulateMedia({ colorScheme: locale === "en" ? "light" : "dark", reducedMotion: "reduce" });
  await page.addInitScript(({ game, locale }) => {
    if (sessionStorage.getItem("long-session-seeded")) return;
    sessionStorage.setItem("long-session-seeded", "1");
    localStorage.setItem("runset.save.v1", JSON.stringify(game));
    localStorage.setItem("runset.language", locale);
    localStorage.setItem("runset.reading", String(locale === "zh-CN"));
    localStorage.setItem("runset.tableExpanded", "true");
    localStorage.setItem("runset.muted", "true");
  }, { game, locale });
  await page.goto("/");
  if (info.project.name) {
    await expect(page.getByRole("status").filter({ hasText: t("Ready offline") })).toBeVisible();
    await context.setOffline(true);
  }
  const resume = async () => {
    await page.getByRole("button", { name: t("Continue game →"), exact: true }).click();
    await expect(page.locator(".rack .tile")).toHaveCount(50);
  };
  const saved = () => page.evaluate(() => localStorage.getItem("runset.save.v1"));
  await resume();
  for (let n = 0; n < 16; n++) {
    await page.locator(`.rack [data-tile-id="${id}"]`).click();
    const place = page.locator(".new-meld");
    await place.scrollIntoViewIfNeeded();
    if (info.project.name === "firefox-desktop") await place.click(); else await place.tap();
    await expect(page.locator(".table .tile")).toHaveCount(51);
    await expect.poll(async () => JSON.parse((await saved())!).players[0].rack.length).toBe(49);
    const draft = JSON.parse((await saved())!);
    expect(validSave(draft)).toBe(true);
    expect(draft.history.length).toBeLessThanOrEqual(100);
    if (!n) expect(draft.history).toHaveLength(100);
    const control = page.getByRole("button", { name: t(n < 8 ? "Undo move" : "Reset turn"), exact: true });
    if (info.project.name === "firefox-desktop") await control.click(); else await control.tap();
    await expect(page.locator(".rack .tile")).toHaveCount(50);
    await expect.poll(async () => JSON.parse((await saved())!).table).toEqual(game.table);
    const restored = JSON.parse((await saved())!);
    expect(restored.players[0].rack).toEqual(game.players[0].rack);
    expect(restored.deadline).toBe(game.deadline);
    expect(restored.turn).toBe(game.turn);
    expect(validSave(restored)).toBe(true);
    const ids = [...restored.pool, ...restored.players.flatMap((p: {rack: number[]}) => p.rack), ...restored.table.flatMap((m: {tiles: number[]}) => m.tiles)];
    expect(ids).toHaveLength(106);
    expect(new Set(ids).size).toBe(106);
  }
  const before = await saved();
  expect(JSON.parse(before!).history).toHaveLength(0);
  await page.reload();
  await resume();
  expect(await saved()).toBe(before);
  await expect(page.locator(".game")).toHaveClass(/table-expanded/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "best-practice"]).analyze()).violations).toEqual([]);
  expect(errors).toEqual([]);
  await info.attach("long-session-evidence", { body: JSON.stringify({ locale, cycles: 16, acceptedEdits: 32, table: 50, rack: 50, initialHistory: 100, deadlinePreserved: true, browser: info.project.name || "chromium", physicalDevice: false }), contentType: "application/json" });
}
