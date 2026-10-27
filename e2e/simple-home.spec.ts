import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { landscapePosition } from "./helpers/landscape";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
// UI-only flow; separate production compatibility cases verify real first-use offline loading.
test.use({ serviceWorkers: "block" });
for (const locale of ["en", "zh-CN"] as const)
  for (const width of [320, 1180])
    test(`${locale} ${width}: simple home keeps safe play, learning and secondary options`, async ({
      page,
    }, info) => {
      const t = locale === "en" ? (s: string) => s : translator(messages),
        game = landscapePosition();
      delete game.turnSeconds;
      delete game.deadline;
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.setViewportSize({ width, height: width === 320 ? 640 : 820 });
      await page.emulateMedia({
        reducedMotion: "reduce",
        colorScheme: locale === "en" ? "light" : "dark",
      });
      await page.addInitScript(
        ({ game, locale, width }) => {
          if (!sessionStorage.getItem("seeded")) {
            localStorage.setItem("runset.save.v1", JSON.stringify(game));
            localStorage.setItem("runset.reading", String(width === 1180));
            localStorage.setItem("runset.contrast", "true");
            sessionStorage.setItem("seeded", "true");
          }
          localStorage.setItem("runset.language", locale);
        },
        { game, locale, width },
      );
      await page.goto("/");
      await expect(page.locator(".home")).toBeVisible();
      const settings = page.getByRole("button", {
        name: t("Settings"),
        exact: true,
      });
      await settings.click();
      await page.getByLabel(t("Simple home screen"), { exact: true }).check();
      await page
        .getByRole("dialog")
        .getByRole("button", { name: t("Done"), exact: true })
        .first()
        .click();
      await expect(settings).toBeFocused();
      const home = page.locator(".simple-home");
      await expect(home).toBeVisible();
      await expect(page.locator("#main-content")).toHaveCount(1);
      await expect(home.locator(":scope > .simple-actions button")).toHaveCount(
        3,
      );
      await expect(
        home.getByRole("button", { name: t("Quick exercises"), exact: true }),
      ).toBeHidden();
      await expect(home.locator(".save-tools")).toBeHidden();
      for (const button of await home
        .locator(":scope > .simple-actions button")
        .all()) {
        expect(
          await button.evaluate((el) => {
            const r = el.getBoundingClientRect();
            return (
              r.height >= 60 &&
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
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "best-practice"])
            .analyze()
        ).violations,
      ).toEqual([]);
      expect(
        await page.evaluate(() =>
          JSON.parse(localStorage.getItem("runset.save.v1")!),
        ),
      ).toEqual(game);
      await page.screenshot({
        path: `/tmp/runset-simple-${info.project.name || "chromium"}-${locale}-${width}.png`,
        fullPage: true,
      });
      await page.reload();
      await expect(home).toBeVisible();
      await home
        .getByRole("button", { name: t("Continue game →"), exact: true })
        .click();
      await expect(page.locator(".table")).toBeVisible();
      await page.locator('.rack [data-tile-id="3"]').click();
      await settings.click();
      await page.getByLabel(t("Simple home screen"), { exact: true }).uncheck();
      await page.keyboard.press("Escape");
      await expect(page.locator('.rack [data-tile-id="3"]')).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      expect(
        await page.evaluate(() =>
          JSON.parse(localStorage.getItem("runset.save.v1")!),
        ),
      ).toEqual(game);
      await page.getByRole("button", { name: t("Home"), exact: true }).click();
      await expect(page.locator(".home")).toBeVisible();
      await settings.click();
      await page.getByLabel(t("Simple home screen"), { exact: true }).check();
      await page.keyboard.press("Escape");
      await home.getByText(t("More options"), { exact: true }).click();
      await expect(home.locator(".save-tools")).toBeVisible();
      await home
        .getByRole("button", { name: t("Delete saved game"), exact: true })
        .click();
      await page
        .getByRole("button", { name: t("Keep game"), exact: true })
        .click();
      expect(
        await page.evaluate(() =>
          JSON.parse(localStorage.getItem("runset.save.v1")!),
        ),
      ).toEqual(game);
      await home
        .getByRole("button", { name: t("Delete saved game"), exact: true })
        .click();
      await page
        .getByRole("button", { name: t("Delete game"), exact: true })
        .click();
      await expect
        .poll(() => page.evaluate(() => localStorage.getItem("runset.save.v1")))
        .toBeNull();
      await page.reload();
      await expect(home).toBeVisible();
      await expect(
        home.getByRole("button", { name: t("Continue game →"), exact: true }),
      ).toHaveCount(0);
      expect(
        await page.evaluate(() => localStorage.getItem("runset.reading")),
      ).toBe(String(width === 1180));
      expect(
        await page.evaluate(() => localStorage.getItem("runset.contrast")),
      ).toBe("true");
      await home
        .getByRole("button", { name: t("Learn to play "), exact: false })
        .click();
      await expect(
        page.getByRole("heading", { name: t("Make a group"), exact: true }),
      ).toBeVisible();
      await page.getByRole("button", { name: t("Home"), exact: true }).click();
      await home
        .getByRole("button", { name: t("New game →"), exact: true })
        .click();
      await page
        .getByRole("button", { name: t("Deal the tiles"), exact: false })
        .click();
      await expect(page.locator(".table")).toBeVisible();
      await expect
        .poll(() =>
          page.evaluate(() => !!localStorage.getItem("runset.save.v1")),
        )
        .toBe(true);
      const fresh = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("runset.save.v1")!),
      );
      expect(
        fresh.players
          .filter((p: { bot: string | null }) => p.bot)
          .map((p: { bot: string }) => p.bot),
      ).toEqual(["easy"]);
      expect(fresh.turnSeconds || 0).toBe(0);
      expect(fresh.coach).toBe(true);
      expect(errors).toEqual([]);
    });

test("a failed simple-home download returns to full home without losing the game", async ({
  page,
}) => {
  const game = landscapePosition();
  delete game.turnSeconds;
  delete game.deadline;
  await page.addInitScript((game) => {
    localStorage.setItem("runset.simpleHome", "true");
    localStorage.setItem("runset.save.v1", JSON.stringify(game));
  }, game);
  await page.route(
    /\/(?:src\/ui\/SimpleHome\.tsx|assets\/SimpleHome-[^/]+\.js)(?:\?.*)?$/,
    (route) => route.abort(),
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: "This screen could not open.",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Return Home", exact: true }).click();
  await expect(page.locator(".home")).toBeVisible();
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("runset.save.v1")!),
    ),
  ).toEqual(game);
  expect(
    await page.evaluate(() => localStorage.getItem("runset.simpleHome")),
  ).toBe("false");
  await page
    .getByRole("button", { name: "Continue game →", exact: true })
    .click();
  await expect(page.locator(".table")).toBeVisible();
});

test("settings restores its opener when opening did not move browser focus", async ({
  page,
}) => {
  await page.goto("/");
  const opener = page.getByRole("button", { name: "Settings", exact: true });
  await page.getByRole("button", { name: "New game →", exact: true }).focus();
  await opener.evaluate((el: HTMLButtonElement) => el.click());
  await page.getByLabel("Simple home screen", { exact: true }).check();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Done", exact: true })
    .first()
    .click();
  await expect(opener).toBeFocused();
  await expect(page.locator(".simple-home")).toBeVisible();
});
