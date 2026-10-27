import { test, expect, type Locator } from "@playwright/test";
import { landscapePosition } from "../e2e/helpers/landscape";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
import { validSave } from "../src/lib/storage";
for (const locale of ["en", "zh-CN"] as const) {
  test(`${locale}: native touch or mouse play, view changes, Undo and reload preserve a draft`, async ({
    page,
  }, info) => {
    const t = locale === "en" ? (s: string) => s : translator(messages),
      game = landscapePosition();
    delete game.turnSeconds;
    delete game.deadline;
    delete game.match;
    game.coach = false;
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.emulateMedia({
      reducedMotion: "reduce",
      colorScheme: locale === "en" ? "light" : "dark",
    });
    await page.addInitScript(
      ({ game, locale }) => {
        if (!localStorage.getItem("runset.save.v1"))
          localStorage.setItem("runset.save.v1", JSON.stringify(game));
        localStorage.setItem("runset.language", locale);
      },
      { game, locale },
    );
    const hit = async (control: Locator) => {
      await control.scrollIntoViewIfNeeded();
      expect(
        await control.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return (
            r.width >= 44 &&
            r.height >= 44 &&
            el.contains(
              document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
            )
          );
        }),
      ).toBe(true);
      if (info.project.use.hasTouch) await control.tap();
      else await control.click();
    };
    await page.goto("/");
    await hit(
      page.getByRole("button", { name: t("Continue game →"), exact: true }),
    );
    await expect(page.locator(".table .tile")).toHaveCount(18);
    await hit(page.locator('.rack [data-tile-id="3"]'));
    await hit(page.locator(".meld-target").first());
    await expect(page.locator('.table [data-tile-id="3"]')).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("runset.save.v1")!).history.length,
        ),
      )
      .toBe(1);
    const draft = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("runset.save.v1")!),
    );
    expect(validSave(draft)).toBe(true);
    await page
      .getByLabel(t("Table view"), { exact: true })
      .selectOption("table");
    await expect(page.locator(".rack")).toBeHidden();
    await page
      .getByLabel(t("Table view"), { exact: true })
      .selectOption("normal");
    await expect(page.locator(".rack")).toBeVisible();
    expect(
      await page.evaluate(() =>
        JSON.parse(localStorage.getItem("runset.save.v1")!),
      ),
    ).toEqual(draft);
    await page.reload();
    await hit(
      page.getByRole("button", { name: t("Continue game →"), exact: true }),
    );
    await expect(page.locator('.table [data-tile-id="3"]')).toBeVisible();
    await hit(page.getByRole("button", { name: t("Undo move"), exact: true }));
    await expect(page.locator('.rack [data-tile-id="3"]')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
    await page.screenshot({
      path: `/tmp/runset-compat-${info.project.name}-${locale}.png`,
    });
  });
  test(`${locale}: verified offline reload and first-use lesson audio keep the regular save`, async ({
    page,
    context,
  }) => {
    const t = locale === "en" ? (s: string) => s : translator(messages),
      game = landscapePosition();
    delete game.turnSeconds;
    delete game.deadline;
    await page.addInitScript(
      ({ game, locale }) => {
        localStorage.setItem("runset.save.v1", JSON.stringify(game));
        localStorage.setItem("runset.language", locale);
        Object.defineProperty(window, "speechSynthesis", {
          value: undefined,
          configurable: true,
        });
        const Native = window.Audio;
        (window as any).__clips = [];
        (window as any).Audio = function (src: string) {
          const a = new Native(src);
          (window as any).__clips.push(a);
          return a;
        };
      },
      { game, locale },
    );
    await page.goto("/");
    await expect(
      page.getByRole("status").filter({ hasText: t("Ready offline") }),
    ).toBeVisible();
    await context.setOffline(true);
    await page.reload();
    await page
      .getByRole("button", { name: t("Learn to play "), exact: false })
      .click();
    await page.getByRole("button", { name: t("Listen"), exact: true }).click();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const a = (window as any).__clips.at(-1);
          return a && !a.paused && a.currentTime > 0;
        }),
      )
      .toBe(true);
    await page
      .getByRole("button", { name: t("Stop audio"), exact: true })
      .click();
    expect(
      await page.evaluate(() =>
        JSON.parse(localStorage.getItem("runset.save.v1")!),
      ),
    ).toEqual(game);
  });
}
