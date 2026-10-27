import { test, expect, type Locator } from "@playwright/test";
import { landscapePosition } from "../e2e/helpers/landscape";
import { chooseView } from "../e2e/helpers/view";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: finders cycle through rack/table selections and actual latest edits offline`, async ({
    page,
    context,
  }, info) => {
    const t = locale === "en" ? (s: string) => s : translator(messages),
      game = landscapePosition(true);
    delete game.match;
    game.coach = false;
    if (locale === "zh-CN") {
      delete game.turnSeconds;
      delete game.deadline;
    }
    await page.emulateMedia({
      colorScheme: locale === "en" ? "light" : "dark",
      reducedMotion: "reduce",
    });
    await page.addInitScript(
      ({ game, locale }) => {
        localStorage.setItem("runset.save.v1", JSON.stringify(game));
        localStorage.setItem("runset.language", locale);
        localStorage.setItem("runset.reading", String(locale === "zh-CN"));
      },
      { game, locale },
    );
    const activate = async (control: Locator) => {
      await control.scrollIntoViewIfNeeded();
      expect(
        await control.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return el.contains(
            document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
          );
        }),
      ).toBe(true);
      if (info.project.name === "firefox-desktop") await control.click();
      else await control.tap();
    };
    const saved = () =>
      page.evaluate(() => localStorage.getItem("runset.save.v1"));
    const find = async (label: string) => {
      await activate(page.locator(".more-actions > summary"));
      await activate(page.getByRole("button", { name: t(label), exact: true }));
    };
    const visible = async (tile: Locator) => {
      await expect(tile).toBeFocused();
      expect(
        await tile.evaluate((el) => {
          const r = el.getBoundingClientRect(),
            region = el.closest(".rack-tiles,.table")!.getBoundingClientRect();
          return (
            r.top >= Math.max(0, region.top) &&
            r.bottom <= Math.min(innerHeight, region.bottom) &&
            r.left >= Math.max(0, region.left) &&
            r.right <= Math.min(innerWidth, region.right)
          );
        }),
      ).toBe(true);
    };
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await expect(
      page.getByRole("status").filter({ hasText: t("Ready offline") }),
    ).toBeVisible();
    if (!process.env.CI)
      await page.screenshot({
        path: `/tmp/runset-home-art-${info.project.name}-${locale}.png`,
        fullPage: true,
      });
    await context.setOffline(true);
    await activate(
      page.getByRole("button", { name: t("Continue game →"), exact: true }),
    );
    await expect(page.locator(".rack")).toBeVisible();
    await activate(page.locator('.rack [data-tile-id="3"]'));
    await activate(page.locator('.table [data-tile-id="36"]'));
    await expect(page.locator('.table [data-tile-id="36"]')).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const before = await saved();
    await chooseView(page, "table", t);
    await expect(page.locator(".rack")).not.toBeVisible();
    await find("Find selected tiles");
    await visible(page.locator('.rack [data-tile-id="3"]'));
    await expect(page.getByLabel(t("Table view"), { exact: true })).toHaveValue(
      "wide",
    );
    await find("Find selected tiles");
    await visible(page.locator('.table [data-tile-id="36"]'));
    for (const id of [3, 36])
      await expect(
        page.locator(`.game .tile[data-tile-id="${id}"]`),
      ).toHaveAttribute("aria-pressed", "true");
    expect(await saved()).toBe(before);
    await activate(
      page.getByRole("button", { name: t("Deselect all"), exact: true }),
    );
    for (const id of [3, 4])
      await activate(page.locator(`.rack [data-tile-id="${id}"]`));
    await activate(page.locator(".new-meld"));
    await expect
      .poll(async () => JSON.parse((await saved())!).history?.length)
      .toBe(1);
    const edited = await saved();
    await find("Find latest placement");
    await visible(page.locator('.table [data-tile-id="3"]'));
    await find("Find latest placement");
    await visible(page.locator('.table [data-tile-id="4"]'));
    expect(await saved()).toBe(edited);
    await activate(
      page.getByRole("button", { name: t("Undo move"), exact: true }),
    );
    await expect(
      page.getByRole("button", { name: t("Undo move"), exact: true }),
    ).toBeDisabled();
    await activate(page.locator(".more-actions > summary"));
    await expect(
      page.getByRole("button", {
        name: t("Find latest placement"),
        exact: true,
      }),
    ).toBeDisabled();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(errors).toEqual([]);
    await page.screenshot({
      path: `/tmp/runset-board-finder-${info.project.name}-${locale}.png`,
    });
  });
