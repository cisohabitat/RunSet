import { chooseView } from "./helpers/view";
import { test, expect, type Page, type Locator } from "@playwright/test";
import { landscapePosition } from "./helpers/landscape";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
test.use({ hasTouch: true });
async function load(page: Page, locale: string, crowded = false) {
  await page.addInitScript(
    ({ s, locale }) => {
      localStorage.setItem("runset.save.v1", JSON.stringify(s));
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.reading", "false");
      localStorage.setItem("runset.largeTiles", "false");
      localStorage.setItem("runset.tableExpanded", "false");
    },
    { s: landscapePosition(crowded), locale },
  );
  await page.goto("/");
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
  await el.tap();
}
async function size(page: Page) {
  return page
    .locator(".table .tile")
    .first()
    .evaluate((el) => {
      const r = el.getBoundingClientRect();
      return [r.width, r.height];
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
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
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
  [360, 640],
  [375, 667],
  [390, 844],
  [430, 932],
  [844, 390],
])
  for (const locale of ["en", "zh-CN"] as const)
    test(`${width} ${locale}: shorter standard phone tiles retain real touch play`, async ({
      page,
    }) => {
      const t = locale === "zh-CN" ? translator(messages) : (s: string) => s;
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.setViewportSize({ width, height });
      await page.emulateMedia({
        reducedMotion: "reduce",
        colorScheme: locale === "zh-CN" ? "dark" : "light",
      });
      await load(page, locale);
      expect(await size(page)).toEqual([44, 54]);
      expect(
        await page
          .locator(".table .tile")
          .first()
          .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
      ).toBeGreaterThanOrEqual(25);
      if (width <= 430)
        expect(
          await page
            .locator(".meld")
            .evaluateAll(
              (cards) =>
                new Set(
                  cards.map((el) => Math.round(el.getBoundingClientRect().top)),
                ).size,
            ),
        ).toBe(3);
      if (width === 390 || width === 430) {
        const count = await page.locator(".rack-tiles").evaluate((el) => {
          const r = el.getBoundingClientRect();
          return [...el.querySelectorAll(".tile")].filter((tile) => {
            const b = tile.getBoundingClientRect();
            return b.left >= r.left && b.right <= r.right;
          }).length;
        });
        expect(count).toBeGreaterThanOrEqual(width === 390 ? 7 : 8);
      }
      const saved = await page.evaluate(() =>
        localStorage.getItem("runset.save.v1"),
      );
      await hit(page.locator('.rack [data-tile-id="3"]'));
      await chooseView(page, "wide", t);
      await bounds(page);
      expect(await size(page)).toEqual([44, 54]);
      await page.setViewportSize({ width: height, height: width });
      await expect(page.locator('.rack [data-tile-id="3"]')).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await page.setViewportSize({ width, height });
      expect(
        await page.evaluate(() => localStorage.getItem("runset.save.v1")),
      ).toBe(saved);
      await bounds(page);
      await hit(page.locator(".meld-target").first());
      await expect(page.locator('.table [data-tile-id="3"]')).toHaveCount(1);
      await hit(
        page.getByRole("button", { name: t("Undo move"), exact: true }),
      );
      await expect(page.locator('.rack [data-tile-id="3"]')).toHaveCount(1);
      // A selected two-digit number and joker must remain distinguishable on small tiles.
      await hit(page.locator('.rack [data-tile-id="12"]'));
      await expect(
        page.locator('.rack [data-tile-id="12"] .tile-check'),
      ).toHaveText("✓");
      await hit(page.locator('.rack [data-tile-id="104"]'));
      await expect(page.locator('.rack [data-tile-id="104"]')).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await expect(
        page.locator('.rack [data-tile-id="104"] .tile-foot'),
      ).not.toBeEmpty();
      expect(
        await page.locator('.rack [data-tile-id="104"]').evaluate((el) => {
          const r = el.getBoundingClientRect(),
            clip = el.closest(".rack-tiles")!.getBoundingClientRect();
          const css = getComputedStyle(el),
            outset =
              parseFloat(css.outlineWidth) + parseFloat(css.outlineOffset);
          return r.top - outset >= clip.top && r.bottom + outset <= clip.bottom;
        }),
      ).toBe(true);
      await page.screenshot({
        path: `/tmp/runset-phone-standard-${width}-${locale}.png`,
        animations: "disabled",
      });
      expect(errors).toEqual([]);
    });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: phone larger reading choices override compact tiles`, async ({
    page,
  }) => {
    const t = locale === "zh-CN" ? translator(messages) : (s: string) => s;
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await load(page, locale, true);
    await expect(page.locator(".rack .tile")).toHaveCount(50);
    const saved = await page.evaluate(() =>
      localStorage.getItem("runset.save.v1"),
    );
    await hit(page.locator('.rack [data-tile-id="3"]'));
    await page.getByRole("button", { name: t("Settings"), exact: true }).tap();
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
    expect(await size(page)).toEqual([54, 74]);
    await page.getByRole("button", { name: t("Settings"), exact: true }).tap();
    await settings
      .getByRole("checkbox", { name: t("Comfortable reading"), exact: true })
      .check();
    await settings
      .getByRole("button", { name: t("Done"), exact: true })
      .last()
      .tap();
    expect(await size(page)).toEqual([58, 80]);
    await expect(page.locator('.rack [data-tile-id="3"]')).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      await page.evaluate(() => localStorage.getItem("runset.save.v1")),
    ).toBe(saved);
  });
