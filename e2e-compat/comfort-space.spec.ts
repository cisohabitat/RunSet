import { test, expect } from "@playwright/test";
import { landscapePosition } from "../e2e/helpers/landscape";
import { chooseView } from "../e2e/helpers/view";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
test.use({ serviceWorkers: "block" });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: comfortable phone keeps readable controls and expanded table`, async ({
    page,
  }) => {
    const t = locale === "en" ? (s: string) => s : translator(messages);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.emulateMedia({
      colorScheme: locale === "en" ? "light" : "dark",
      reducedMotion: "reduce",
    });
    const game = landscapePosition();
    await page.addInitScript(
      ({ game, locale }) => {
        localStorage.setItem("runset.save.v1", JSON.stringify(game));
        localStorage.setItem("runset.language", locale);
        localStorage.setItem("runset.reading", "true");
      },
      { game, locale },
    );
    await page.goto("/");
    await page
      .getByRole("button", { name: t("Continue game →"), exact: true })
      .click();
    await page.locator('.rack [data-tile-id="3"]').click();
    const saved = await page.evaluate(() =>
      localStorage.getItem("runset.save.v1"),
    );
    await chooseView(page, "wide", t);
    const board = await page.locator(".table").boundingBox();
    expect(board).not.toBeNull();
    expect(
      Math.min(667, board!.y + board!.height) - Math.max(0, board!.y),
    ).toBeGreaterThanOrEqual(300);
    for (const control of await page
      .locator(
        ".turn-tools > button,.turn-tools > details > summary,.primary-actions > button",
      )
      .all()) {
      const r = await control.boundingBox();
      if (!r) continue;
      expect(r.width).toBeGreaterThanOrEqual(48);
      expect(r.height).toBeGreaterThanOrEqual(48);
      expect(r.x).toBeGreaterThanOrEqual(0);
      expect(r.x + r.width).toBeLessThanOrEqual(375);
      expect(r.y + r.height).toBeLessThanOrEqual(667);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("button", { name: new RegExp(t("Preview selected tiles")) })
      .click();
    await page
      .getByRole("button", { name: t("Back to table"), exact: true })
      .click();
    await expect(page.locator('.rack [data-tile-id="3"]')).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      await page.evaluate(() => localStorage.getItem("runset.save.v1")),
    ).toBe(saved);
    await page.screenshot({ path: `/tmp/runset-comfort-space-${locale}.png` });
  });
