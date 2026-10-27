import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { landscapePosition } from "./helpers/landscape";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
test.use({ hasTouch: true });
for (const locale of ["en", "zh-CN"] as const)
  for (const theme of ["light", "dark"] as const)
    for (const [width, height] of [
      [375, 667],
      [844, 390],
      [1180, 820],
    ])
      test(`${locale} ${theme} ${width}: contrast preserves play, targets and preferences`, async ({
        page,
      }, info) => {
        const t = locale === "en" ? (s: string) => s : translator(messages);
        const game = landscapePosition();
        delete game.match;
        delete game.turnSeconds;
        delete game.deadline;
        game.coach = false;
        const errors: string[] = [];
        page.on("pageerror", (e) => errors.push(e.message));
        await page.setViewportSize({ width, height });
        await page.emulateMedia({
          colorScheme: theme,
          reducedMotion: "reduce",
        });
        await page.addInitScript(
          ({ game, locale }) => {
            if (!sessionStorage.getItem("seeded")) {
              localStorage.setItem("runset.save.v1", JSON.stringify(game));
              sessionStorage.setItem("seeded", "true");
            }
            localStorage.setItem("runset.language", locale);
          },
          { game, locale },
        );
        await page.goto("/");
        const resume = () =>
          page
            .getByRole("button", { name: t("Continue game →"), exact: true })
            .click();
        await resume();
        const tile = page.locator('.rack [data-tile-id="3"]');
        await tile.click();
        const before = await tile.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return { width: r.width, height: r.height };
        });
        const settings = page.getByRole("button", {
          name: t("Settings"),
          exact: true,
        });
        await settings.click();
        const dialog = page.getByRole("dialog");
        await dialog.getByLabel(t("Higher contrast"), { exact: true }).check();
        await dialog
          .getByRole("button", { name: t("Done"), exact: true })
          .first()
          .click();
        await expect(page.locator("html")).toHaveAttribute(
          "data-contrast",
          "high",
        );
        await expect(tile).toHaveAttribute("aria-pressed", "true");
        expect(
          await tile.evaluate((el) => {
            const r = el.getBoundingClientRect();
            return { width: r.width, height: r.height };
          }),
        ).toEqual(before);
        expect(
          await page.evaluate(() =>
            JSON.parse(localStorage.getItem("runset.save.v1")!),
          ),
        ).toEqual(game);
        // Measure the actual rendered tile colours, including the selected surface.
        const contrast = await page.locator(".tile").evaluateAll((els) =>
          els.map((el) => {
            const c = getComputedStyle(el);
            const luminance = (s: string) => {
              const rgb = s
                .match(/[\d.]+/g)!
                .slice(0, 3)
                .map(Number)
                .map((v) => {
                  v /= 255;
                  return v <= 0.04045
                    ? v / 12.92
                    : ((v + 0.055) / 1.055) ** 2.4;
                });
              return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
            };
            const a = luminance(c.color),
              b = luminance(c.backgroundColor);
            return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
          }),
        );
        expect(Math.min(...contrast)).toBeGreaterThanOrEqual(7);
        await page.locator(".new-meld").click();
        await expect(page.locator(".meld.invalid")).toBeVisible();
        expect(
          (
            await new AxeBuilder({ page })
              .withTags(["wcag2a", "wcag2aa", "best-practice"])
              .analyze()
          ).violations,
        ).toEqual([]);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
        ).toBe(true);
        await page
          .getByRole("combobox", { name: t("Table view"), exact: true })
          .selectOption("table");
        for (const name of ["Undo move", "Reset turn"]) {
          const control = page.getByRole("button", {
            name: t(name),
            exact: true,
          });
          expect(
            await control.evaluate((el) => {
              const r = el.getBoundingClientRect();
              return (
                r.height >= 44 &&
                r.width >= 44 &&
                r.top >= 0 &&
                r.bottom <= innerHeight &&
                el.contains(
                  document.elementFromPoint(
                    r.x + r.width / 2,
                    r.y + r.height / 2,
                  ),
                )
              );
            }),
          ).toBe(true);
        }
        await page.screenshot({
          path: `/tmp/runset-contrast-${info.project.name || "chromium"}-${locale}-${theme}-${width}.png`,
        });
        await page
          .getByRole("button", { name: t("Undo move"), exact: true })
          .click();
        await expect
          .poll(() =>
            page.evaluate(
              () => JSON.parse(localStorage.getItem("runset.save.v1")!).table,
            ),
          )
          .toEqual(game.table);
        await page.reload();
        await expect(page.locator("html")).toHaveAttribute(
          "data-contrast",
          "high",
        );
        await resume();
        await page
          .getByRole("button", { name: t("Home"), exact: true })
          .click();
        await page
          .getByRole("button", { name: t("Delete saved game"), exact: true })
          .click();
        await page
          .getByRole("button", { name: t("Delete game"), exact: true })
          .click();
        expect(
          await page.evaluate(() => localStorage.getItem("runset.save.v1")),
        ).toBeNull();
        await page.reload();
        await expect(page.locator("html")).toHaveAttribute(
          "data-contrast",
          "high",
        );
        expect(errors).toEqual([]);
      });

test("contrast can be turned off without changing comfortable reading", async ({
  page,
}) => {
  const game = landscapePosition();
  delete game.match;
  delete game.turnSeconds;
  delete game.deadline;
  await page.setViewportSize({ width: 320, height: 640 });
  await page.addInitScript((game) => {
    localStorage.setItem("runset.save.v1", JSON.stringify(game));
    localStorage.setItem("runset.reading", "true");
    localStorage.setItem("runset.contrast", "true");
  }, game);
  await page.goto("/");
  await page
    .getByRole("button", { name: "Continue game →", exact: true })
    .click();
  const tile = page.locator('.rack [data-tile-id="3"]');
  await tile.click();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByLabel("Higher contrast", { exact: true }).uncheck();
  await page.keyboard.press("Escape");
  await expect(page.locator(".app")).toHaveClass(/comfortable-reading/);
  await expect(tile).toHaveAttribute("aria-pressed", "true");
  expect(
    await tile.evaluate((el) => ({
      w: el.getBoundingClientRect().width,
      h: el.getBoundingClientRect().height,
    })),
  ).toEqual({ w: 58, h: 80 });
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("runset.save.v1")!),
    ),
  ).toEqual(game);
});
