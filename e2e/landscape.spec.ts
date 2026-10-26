import { test, expect, type Locator, type Page } from "@playwright/test";
import { landscapePosition } from "./helpers/landscape";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
test.use({ hasTouch: true });
async function load(page: Page, locale: string, crowded = false, bots = 1) {
  await page.addInitScript(
    ({ s, locale }) => {
      localStorage.setItem("runset.save.v1", JSON.stringify(s));
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.reading", "false");
      localStorage.setItem("runset.largeTiles", "false");
      localStorage.setItem("runset.tableExpanded", "false");
    },
    { s: landscapePosition(crowded, bots), locale },
  );
  await page.goto("/");
  await page
    .getByRole("button", {
      name: locale === "zh-CN" ? "继续游戏 →" : "Continue game →",
      exact: true,
    })
    .click();
  await expect(page.locator(".table")).toBeVisible();
}
async function hit(control: Locator) {
  await control.scrollIntoViewIfNeeded();
  expect(
    await control.evaluate((el) => {
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
  await control.tap();
}
async function tileSize(page: Page) {
  return page
    .locator(".table .tile")
    .first()
    .evaluate((el) => {
      const r = el.getBoundingClientRect();
      return [r.width, r.height];
    });
}
async function stable(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
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
}
for (const [width, height] of [
  [1024, 768],
  [1180, 820],
  [1366, 1024],
])
  for (const locale of ["en", "zh-CN"] as const) {
    test(`${width} ${locale}: denser landscape preserves touch play and rotation`, async ({
      page,
    }) => {
      const t = locale === "zh-CN" ? translator(messages) : (s: string) => s;
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.setViewportSize({ width, height });
      await page.emulateMedia({
        colorScheme: locale === "zh-CN" ? "dark" : "light",
        reducedMotion: "reduce",
      });
      await load(page, locale);
      expect(await tileSize(page)).toEqual([44, 60]);
      expect(
        await page
          .locator(".meld")
          .evaluateAll(
            (cards) =>
              new Set(
                cards.map((el) => Math.round(el.getBoundingClientRect().top)),
              ).size,
          ),
      ).toBe(1);
      expect(
        await page
          .locator(".site-header")
          .evaluate((el) => el.getBoundingClientRect().height),
      ).toBeLessThanOrEqual(56);
      expect(
        await page
          .locator(".game-heading h1")
          .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
      ).toBeLessThanOrEqual(24);
      expect(
        await page.locator(".first-game-guide p").evaluate((el) => {
          const r = el.getBoundingClientRect(),
            c = el.closest(".game-context")!.getBoundingClientRect();
          return r.top >= c.top && r.bottom <= c.bottom;
        }),
      ).toBe(true);
      await stable(page);
      const saved = await page.evaluate(() =>
        localStorage.getItem("runset.save.v1"),
      );
      await page.screenshot({
        path: `/tmp/runset-ipad-landscape-${width}-${locale}.png`,
        animations: "disabled",
      });
      await hit(page.locator('.rack [data-tile-id="3"]'));
      await page.setViewportSize({ width: height, height: width });
      await expect(page.locator('.rack [data-tile-id="3"]')).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect((await tileSize(page))[0]).toBeGreaterThan(44);
      expect(
        await page.evaluate(() => localStorage.getItem("runset.save.v1")),
      ).toBe(saved);
      await page.setViewportSize({ width, height });
      expect(await tileSize(page)).toEqual([44, 60]);
      await hit(
        page.getByRole("button", { name: t("Expand table"), exact: true }),
      );
      expect(await tileSize(page)).toEqual([44, 60]);
      await stable(page);
      await hit(page.locator(".meld-target").first());
      await expect(page.locator('.table [data-tile-id="3"]')).toHaveCount(1);
      await hit(
        page.getByRole("button", { name: t("Undo move"), exact: true }),
      );
      await expect(page.locator('.rack [data-tile-id="3"]')).toHaveCount(1);
      await page.keyboard.press("Escape");
      await stable(page);
      expect(errors).toEqual([]);
    });
  }
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: crowded landscape respects larger display choices`, async ({
    page,
  }) => {
    const t = locale === "zh-CN" ? translator(messages) : (s: string) => s;
    await page.setViewportSize({ width: 1180, height: 820 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await load(page, locale, true);
    await expect(page.locator(".rack .tile")).toHaveCount(50);
    const saved = await page.evaluate(() =>
      localStorage.getItem("runset.save.v1"),
    );
    await hit(page.locator('.rack [data-tile-id="3"]'));
    await hit(page.getByRole("button", { name: t("Settings"), exact: true }));
    const settings = page.getByRole("dialog", {
      name: t("Settings"),
      exact: true,
    });
    await settings
      .getByRole("checkbox", { name: t("Larger touch controls"), exact: true })
      .check();
    await settings
      .getByRole("button", { name: t("Done"), exact: true })
      .last()
      .tap();
    expect((await tileSize(page))[0]).toBeGreaterThanOrEqual(52);
    expect((await tileSize(page))[1]).toBeGreaterThanOrEqual(70);
    await stable(page);
    await hit(page.getByRole("button", { name: t("Settings"), exact: true }));
    await settings
      .getByRole("checkbox", { name: t("Comfortable reading"), exact: true })
      .check();
    await settings
      .getByRole("button", { name: t("Done"), exact: true })
      .last()
      .tap();
    expect(await tileSize(page)).toEqual([58, 80]);
    await expect(page.locator('.rack [data-tile-id="3"]')).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      await page.evaluate(() => localStorage.getItem("runset.save.v1")),
    ).toBe(saved);
    await page
      .getByRole("button", { name: t("Expand table"), exact: true })
      .tap();
    await stable(page);
    await page.screenshot({
      path: `/tmp/runset-ipad-landscape-large-${locale}.png`,
      animations: "disabled",
    });
  });

for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: landscape contains three opponents and live hint controls`, async ({
    page,
  }) => {
    const t = locale === "zh-CN" ? translator(messages) : (s: string) => s;
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await load(page, locale, false, 3);
    expect(
      await page.locator(".opponent").evaluateAll((cards) =>
        cards.every((el) => {
          const r = el.getBoundingClientRect(),
            p = el.closest(".opponents")!.getBoundingClientRect();
          return r.left >= p.left && r.right <= p.right;
        }),
      ),
    ).toBe(true);
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
      hint.getByRole("button", { name: t("Dismiss hint"), exact: true }),
    ).toBeVisible();
    await hit(
      hint.getByRole("button", { name: t("Dismiss hint"), exact: true }),
    );
    await stable(page);
  });

test("mouse desktop keeps its existing tile and heading sizes", async ({
  browser,
}) => {
  const context = await browser.newContext({
    hasTouch: false,
    viewport: { width: 1180, height: 820 },
  });
  const page = await context.newPage();
  try {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await load(page, "en");
    expect(await tileSize(page)).toEqual([52, 70]);
    expect(
      await page
        .locator(".site-header")
        .evaluate((el) => el.getBoundingClientRect().height),
    ).toBe(68);
  } finally {
    await context.close();
  }
});
