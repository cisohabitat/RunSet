import {
  expect,
  type Page,
  type BrowserContext,
  type TestInfo,
} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { crowdedBorrow } from "../../scripts/endgame-fixtures";
import { validSave } from "../../src/lib/storage";
import { inspectMeld } from "../../src/engine/meld";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";

export async function verifyEndgame(
  page: Page,
  context: BrowserContext,
  info: TestInfo,
  locale: "en" | "zh-CN",
  offline: boolean,
) {
  const game = crowdedBorrow(locale === "zh-CN"),
    t = locale === "en" ? (s: string) => s : translator(messages);
  expect(validSave(game)).toBe(true);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({
    reducedMotion: "reduce",
    colorScheme: locale === "en" ? "light" : "dark",
  });
  await page.addInitScript(
    ({ game, locale }) => {
      if (sessionStorage.getItem("endgame-seeded")) return;
      sessionStorage.setItem("endgame-seeded", "1");
      localStorage.setItem("runset.save.v1", JSON.stringify(game));
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.reading", String(locale === "zh-CN"));
      localStorage.setItem("runset.pace", "700");
      localStorage.setItem("runset.muted", "true");
    },
    { game, locale },
  );
  await page.goto("/");
  if (offline) {
    await expect(
      page.getByRole("status").filter({ hasText: t("Ready offline") }),
    ).toBeVisible();
    await context.setOffline(true);
    await page.reload();
  }
  const resume = page.getByRole("button", {
    name: t("Continue game →"),
    exact: true,
  });
  await resume.scrollIntoViewIfNeeded();
  await expect
    .poll(() =>
      resume.evaluate((el) => {
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
    )
    .toBe(true);
  if (info.project.name === "firefox-desktop") await resume.click();
  else await resume.tap();
  const saved = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("runset.save.v1")!));
  await expect.poll(async () => (await saved()).phase).toBe("over");
  await expect(page.locator(".game-over")).toBeVisible();
  const final = await saved();
  expect(validSave(final)).toBe(true);
  expect(final.players[0].rack).toEqual([]);
  expect(final.players[1].rack).toEqual(game.players[1].rack);
  expect(final.pool).toEqual([]);
  expect(final.passes).toBe(0);
  expect(
    final.table.every((m: { tiles: number[] }) => inspectMeld(m.tiles).valid),
  ).toBe(true);
  const ids = [
    ...final.players.flatMap((p: { rack: number[] }) => p.rack),
    ...final.table.flatMap((m: { tiles: number[] }) => m.tiles),
  ];
  expect(ids).toHaveLength(106);
  expect(new Set(ids).size).toBe(106);
  expect(
    final.lastPlaced.slice().sort((a: number, b: number) => a - b),
  ).toEqual([31, 33]);
  expect(
    (await new AxeBuilder({ page }).include(".game-over").analyze()).violations,
  ).toEqual([]);
  await page.screenshot({
    path: `/tmp/runset-endgame-${info.project.name || "chromium"}-${locale}.png`,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
}
