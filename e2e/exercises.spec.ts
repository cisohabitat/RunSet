import { test, expect } from "@playwright/test";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
import { landscapePosition } from "./helpers/landscape";
for (const locale of ["en", "zh-CN"] as const)
  for (const width of [360, 1180]) {
    test(`${locale} ${width}: four targeted exercises preserve the regular game`, async ({
      page,
    }) => {
      const t = locale === "en" ? (s: string) => s : translator(messages);
      await page.setViewportSize({ width, height: width === 360 ? 640 : 820 });
      const game = landscapePosition();
      await page.addInitScript(
        ({ locale, game }) => {
          localStorage.setItem("runset.language", locale);
          localStorage.setItem("runset.save.v1", JSON.stringify(game));
          localStorage.setItem("runset.muted", "true");
        },
        { locale, game },
      );
      await page.goto("/");
      await page
        .getByRole("button", { name: t("Quick exercises") + " →", exact: true })
        .click();
      const choose = async (name: string) =>
        page.getByRole("button", { name: t(name) + " →", exact: true }).click();
      const move = async (ids: number[], existing = false) => {
        for (const id of ids)
          await page.locator(`.game [data-tile-id="${id}"]`).click();
        await page
          .locator(existing ? ".meld-target" : ".new-meld")
          .first()
          .click();
      };
      const check = () =>
        page
          .getByRole("button", { name: t("Check move"), exact: true })
          .click();
      const done = async () => {
        await check();
        await expect(
          page.getByRole("heading", { name: t("Well done! Goal complete.") }),
        ).toBeVisible();
        await page
          .getByRole("button", {
            name: t("Choose another exercise"),
            exact: true,
          })
          .click();
      };
      await choose("Open with 30 points");
      await expect(page.locator(".table")).toBeVisible();
      await move([0, 1, 2]);
      await check();
      await expect(
        page.getByRole("heading", { name: t("Well done! Goal complete.") }),
      ).toHaveCount(0);
      await page
        .getByRole("button", { name: t("Restart exercise"), exact: true })
        .click();
      await expect(page.locator('.game [aria-pressed="true"]')).toHaveCount(0);
      await move([9, 35, 61]);
      await done();
      await choose("Extend a run");
      await move([3], true);
      await done();
      await choose("Fill the gap");
      await move([1], true);
      await done();
      await choose("Replace and reuse a joker");
      await move([4], true);
      await check();
      await expect(
        page.getByRole("heading", { name: t("Well done! Goal complete.") }),
      ).toHaveCount(0);
      await move([104, 30, 56]);
      await done();
      expect(
        await page.evaluate(() =>
          JSON.parse(localStorage.getItem("runset.save.v1")!),
        ),
      ).toEqual(game);
      await choose("Fill the gap");
      await page
        .getByRole("button", { name: t("Show clue"), exact: true })
        .click();
      await page.screenshot({
        path: `/tmp/runset-exercises-${locale}-${width}.png`,
        fullPage: true,
      });
      await page.reload();
      await page
        .getByRole("button", { name: t("Quick exercises") + " →", exact: true })
        .click();
      await expect(page.locator('.game [data-tile-id="0"]')).toBeVisible();
      await move([1], true);
      await check();
      await expect(
        page.getByRole("heading", { name: t("Well done! Goal complete.") }),
      ).toBeVisible();
    });
  }
