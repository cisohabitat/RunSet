import { test, expect, type Locator } from "@playwright/test";
import { landscapePosition } from "./helpers/landscape";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";

async function focusRing(control: Locator) {
  await control.focus();
  const result = await control.evaluate((el) => {
    const luminance = (color: string) => {
      const c = color
        .match(/[\d.]+/g)!
        .slice(0, 3)
        .map(Number)
        .map((n) => n / 255)
        .map((n) => (n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4));
      return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
    };
    let ancestor = el.parentElement;
    while (
      ancestor &&
      getComputedStyle(ancestor).backgroundColor === "rgba(0, 0, 0, 0)"
    )
      ancestor = ancestor.parentElement;
    const css = getComputedStyle(el),
      a = luminance(css.outlineColor),
      b = luminance(
        getComputedStyle(ancestor ?? document.documentElement).backgroundColor,
      );
    const border = luminance(css.borderTopColor);
    return {
      formField: el.matches("input, select"),
      borderContrast:
        (Math.max(border, b) + 0.05) / (Math.min(border, b) + 0.05),
      visible: el.matches(":focus-visible"),
      width: parseFloat(css.outlineWidth),
      contrast: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
    };
  });
  expect(result.visible).toBe(true);
  expect(result.width).toBeGreaterThanOrEqual(2);
  expect(result.contrast).toBeGreaterThanOrEqual(3);
  if (result.formField) expect(result.borderContrast).toBeGreaterThanOrEqual(3);
}
for (const [device, width, height, touch] of [
  ["phone", 360, 640, true],
  ["ipad", 1180, 820, true],
  ["desktop", 1440, 900, false],
] as const) {
  test.describe(device, () => {
    test.use({ viewport: { width, height }, hasTouch: touch });
    for (const locale of ["en", "zh-CN"] as const)
      for (const theme of ["light", "dark"] as const)
        test(`${locale} ${theme}: readable foundations and visible keyboard focus`, async ({
          page,
        }) => {
          const t =
            locale === "zh-CN" ? translator(messages) : (s: string) => s;
          await page.emulateMedia({
            colorScheme: theme,
            reducedMotion: "reduce",
          });
          await page.addInitScript(
            (locale) => localStorage.setItem("runset.language", locale),
            locale,
          );
          const errors: string[] = [];
          page.on("pageerror", (e) => errors.push(e.message));
          await page.goto("/");
          await page.screenshot({
            path: `/tmp/runset-foundations-${device}-${locale}-${theme}-home.png`,
            fullPage: true,
          });
          await page
            .getByRole("button", { name: t("New game →"), exact: true })
            .click();
          await page.keyboard.press("Tab");
          await focusRing(
            page.getByLabel(t("What should we call you?"), { exact: true }),
          );
          await page.screenshot({
            path: `/tmp/runset-foundations-${device}-${locale}-${theme}-setup.png`,
            fullPage: true,
          });
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          ).toBe(true);
          await page
            .getByRole("button", { name: t("← Back"), exact: true })
            .click();
          await page.evaluate(
            (s) => localStorage.setItem("runset.save.v1", JSON.stringify(s)),
            landscapePosition(),
          );
          await page.reload();
          await page
            .getByRole("button", { name: t("Continue game →"), exact: true })
            .click();
          await expect(page.locator(".table")).toBeVisible();
          await page.keyboard.press("Tab");
          await focusRing(page.getByLabel(t("Table view"), { exact: true }));
          await focusRing(page.locator('.rack [data-tile-id="3"]'));
          await page.screenshot({
            path: `/tmp/runset-foundations-${device}-${locale}-${theme}-game.png`,
            fullPage: true,
          });
          expect(
            await page.evaluate(
              () => document.documentElement.scrollWidth <= innerWidth,
            ),
          ).toBe(true);
          expect(errors).toEqual([]);
        });
  });
}
