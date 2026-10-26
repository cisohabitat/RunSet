import { test, expect, type Page, type Locator } from "@playwright/test";
import { landscapePosition } from "./helpers/landscape";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
test.use({ hasTouch: true });
async function load(page: Page, locale: string, reading: boolean) {
  await page.goto("/");
  await page.evaluate(
    ({ s, locale, reading }) => {
      localStorage.setItem("runset.save.v1", JSON.stringify(s));
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.reading", String(reading));
      localStorage.setItem("runset.largeTiles", "false");
      localStorage.setItem("runset.tableExpanded", "false");
      localStorage.setItem("runset.pace", "2400");
    },
    { s: landscapePosition(), locale, reading },
  );
  await page.reload();
  await page
    .getByRole("button", {
      name: locale === "zh-CN" ? "继续游戏 →" : "Continue game →",
      exact: true,
    })
    .tap();
  await expect(page.locator(".table")).toBeVisible();
}
async function hit(el: Locator) {
  await el.scrollIntoViewIfNeeded();
  expect(
    await el.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return (
        r.height >= 44 &&
        r.width >= 44 &&
        r.left >= 0 &&
        r.right <= innerWidth &&
        r.top >= 0 &&
        r.bottom <= innerHeight &&
        el.contains(
          document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
        )
      );
    }),
  ).toBe(true);
  await el.tap();
}
async function board(page: Page) {
  return page.locator(".table").evaluate((el) => {
    const r = el.getBoundingClientRect();
    return Math.min(r.bottom, innerHeight) - Math.max(0, r.top);
  });
}
async function bounds(page: Page) {
  expect(
    await page
      .locator(".table")
      .evaluate(
        (el) =>
          el.getBoundingClientRect().bottom <=
          document.querySelector(".player-dock")!.getBoundingClientRect().top,
      ),
  ).toBe(true);
  expect(
    await page.locator(".primary-actions").evaluate((el) => {
      const r = el.getBoundingClientRect();
      return r.top >= 0 && r.bottom <= innerHeight;
    }),
  ).toBe(true);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await expect(page.getByRole("timer")).toHaveCount(1);
}
async function savedUndo(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const s = JSON.parse(localStorage.getItem("runset.save.v1")!);
        return (
          s.history?.length === 0 &&
          s.players[0].rack.includes(3) &&
          !s.table.some((meld: { tiles: number[] }) => meld.tiles.includes(3))
        );
      }),
    )
    .toBe(true);
}
for (const [width, height] of [
  [360, 640],
  [375, 667],
  [390, 844],
  [820, 1180],
  [1180, 820],
  [844, 390],
])
  for (const locale of ["en", "zh-CN"] as const)
    for (const reading of [false, true])
      test(`${width} ${locale} reading=${reading}: hide rack gives more table without changing the game`, async ({
        page,
      }) => {
        const t = locale === "zh-CN" ? translator(messages) : (s: string) => s;
        const errors: string[] = [];
        page.on("pageerror", (e) => errors.push(e.message));
        await page.setViewportSize({ width, height });
        await page.emulateMedia({
          reducedMotion: "reduce",
          colorScheme: reading ? "dark" : "light",
        });
        await load(page, locale, reading);
        await expect(
          page.getByRole("button", { name: t("Hide rack"), exact: true }),
        ).toHaveCount(0);
        const snapshot = await page.evaluate(() =>
          localStorage.getItem("runset.save.v1"),
        );
        await page.locator('.rack [data-tile-id="3"]').tap();
        await page
          .getByRole("button", { name: t("Expand table"), exact: true })
          .tap();
        const before = await board(page);
        const hide = page.getByRole("button", {
          name: t("Hide rack"),
          exact: true,
        });
        await expect(hide).toHaveAttribute("aria-expanded", "true");
        await hit(hide);
        const show = page.getByRole("button", {
          name: t("Show rack"),
          exact: true,
        });
        await expect(show).toHaveAttribute("aria-expanded", "false");
        await expect(show).toHaveAttribute("aria-controls", "player-rack");
        await expect(page.locator("#player-rack")).toBeHidden();
        expect((await board(page)) - before).toBeGreaterThanOrEqual(60);
        await bounds(page);
        expect(
          await page.evaluate(() => localStorage.getItem("runset.save.v1")),
        ).toBe(snapshot);
        await expect(page.locator('.rack [data-tile-id="3"]')).toHaveAttribute(
          "aria-pressed",
          "true",
        );
        await page.screenshot({
          path: `/tmp/runset-more-table-${width}-${locale}-${reading}.png`,
          animations: "disabled",
        });
        await hit(page.locator(".meld-target").first());
        await expect(page.locator('.table [data-tile-id="3"]')).toHaveCount(1);
        await expect(page.locator("#player-rack")).toBeHidden();
        await hit(
          page.getByRole("button", { name: t("Undo move"), exact: true }),
        );
        await expect(page.locator('.rack [data-tile-id="3"]')).toHaveCount(1);
        await savedUndo(page);
        // Hints must remain actionable with the rack hidden on compact and large views.
        if (
          locale === "zh-CN" &&
          ((width === 375 && !reading) ||
            (width === 820 && reading) ||
            (width === 844 && reading))
        ) {
          const saved = await page.evaluate(() =>
            localStorage.getItem("runset.save.v1"),
          );
          await hit(
            page.getByRole("button", {
              name: t("Show a possible move"),
              exact: true,
            }),
          );
          const hint = page.getByRole("complementary", {
            name: t("Move hint"),
            exact: true,
          });
          await expect(
            hint.getByRole("button", { name: t("Place hint"), exact: true }),
          ).toBeVisible();
          expect(
            await page.evaluate(() => localStorage.getItem("runset.save.v1")),
          ).toBe(saved);
          await hit(
            hint.getByRole("button", { name: t("Place hint"), exact: true }),
          );
          await expect(page.locator("#player-rack")).toBeHidden();
          await hit(
            page.getByRole("button", { name: t("Undo move"), exact: true }),
          );
          await savedUndo(page);
        }
        await hit(show);
        await expect(page.locator("#player-rack")).toBeVisible();
        await page.locator('.rack [data-tile-id="12"]').tap();
        const saved = await page.evaluate(() =>
          localStorage.getItem("runset.save.v1"),
        );
        await hit(hide);
        await hit(show);
        await expect(page.locator('.rack [data-tile-id="12"]')).toHaveAttribute(
          "aria-pressed",
          "true",
        );
        expect(
          await page.evaluate(() => localStorage.getItem("runset.save.v1")),
        ).toBe(saved);
        await hit(hide);
        await page
          .getByRole("button", { name: t("Compact table"), exact: true })
          .tap();
        await expect(page.locator("#player-rack")).toBeVisible();
        expect(
          await page.evaluate(() => document.body.style.overflow),
        ).not.toBe("hidden");
        await page
          .getByRole("button", { name: t("Expand table"), exact: true })
          .tap();
        await expect(page.locator("#player-rack")).toBeVisible();
        await expect(hide).toBeVisible();
        // The next turn starts with the rack available, including while a bot thinks.
        await hit(hide);
        await page
          .getByRole("button", { name: t("Draw a tile") + " ↓", exact: true })
          .tap();
        await expect(page.locator("#player-rack")).toBeVisible();
        await expect(hide).toBeVisible();
        await bounds(page);
        if (width === 390 && !reading && locale === "en") {
          await hit(hide);
          await page.reload();
          await page
            .getByRole("button", { name: "Continue game →", exact: true })
            .tap();
          await expect(page.locator(".game.table-expanded")).toBeVisible();
          await expect(page.locator("#player-rack")).toBeVisible();
        }
        expect(errors).toEqual([]);
      });

test("hidden rack keeps native penalty Escape separate from leaving expanded view", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await load(page, "en", false);
  await page.locator('.rack [data-tile-id="3"]').tap();
  await page.getByRole("button", { name: "Expand table", exact: true }).tap();
  await hit(page.getByRole("button", { name: "Hide rack", exact: true }));
  await hit(page.locator(".new-meld"));
  await page
    .getByRole("button", { name: "+3 tiles · End turn", exact: true })
    .tap();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".game.table-expanded")).toBeVisible();
  await expect(page.locator("#player-rack")).toBeHidden();
  await page.keyboard.press("Escape");
  await expect(page.locator(".game.table-expanded")).toHaveCount(0);
  await expect(page.locator("#player-rack")).toBeVisible();
});

test("practice keeps its rack visible and does not offer the temporary hiding control", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.evaluate(() =>
    localStorage.setItem("runset.tableExpanded", "true"),
  );
  await page.getByRole("button", { name: /Learn to play/ }).tap();
  await expect(page.locator(".table")).toBeVisible();
  await expect(page.locator(".game.table-expanded")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Hide rack", exact: true }),
  ).toHaveCount(0);
  await expect(page.locator("#player-rack")).toBeVisible();
});
