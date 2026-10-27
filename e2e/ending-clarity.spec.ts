import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { jokerFinish } from "./helpers/finish";
import { results } from "../src/engine/game";
import { learningTakeaway } from "../src/lib/roundSummary";
import { validSave } from "../src/lib/storage";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
for (const locale of ["en", "zh-CN"] as const)
  for (const width of [375, 1180])
    test(`${locale} ${width}: visual scores and the learning note agree with the finished rack`, async ({
      page,
    }) => {
      const t = locale === "en" ? (s: string) => s : translator(messages),
        game = jokerFinish();
      expect(game.phase).toBe("over");
      expect(validSave(game)).toBe(true);
      await page.setViewportSize({ width, height: width === 375 ? 667 : 820 });
      await page.emulateMedia({
        reducedMotion: "reduce",
        colorScheme: locale === "en" ? "light" : "dark",
      });
      await page.addInitScript(
        ({ game, locale }) => {
          localStorage.setItem("runset.save.v1", JSON.stringify(game));
          localStorage.setItem("runset.language", locale);
        },
        { game, locale },
      );
      await page.goto("/");
      await page
        .getByRole("button", { name: t("View results →"), exact: true })
        .click();
      const scores = results(game);
      for (const player of scores) {
        const meter = page.getByRole("meter", {
          name: t(`${player.name}: remaining rack value`),
          exact: true,
        });
        await expect(meter).toHaveAttribute("value", String(player.total));
      }
      await expect(page.locator(".score-transfer")).toContainText("43 → -43");
      await expect(page.locator(".score-transfer")).toContainText("0 → +43");
      await expect(page.locator(".learning-takeaway")).toContainText(
        t(learningTakeaway(game).message),
      );
      await expect(page.locator(".learning-takeaway .tile")).toHaveCount(1);
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
      expect(
        await page.evaluate(() =>
          JSON.parse(localStorage.getItem("runset.save.v1")!),
        ),
      ).toEqual(game);
      await page.locator(".score-transfer").scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `/tmp/runset-ending-${locale}-${width}.png`,
      });
      await page
        .getByRole("button", { name: t("Change settings"), exact: true })
        .click();
      await expect(
        page.getByLabel(t("What should we call you?"), { exact: true }),
      ).toHaveValue("Pass");
      await expect(page.locator(".setup-summary")).toContainText(t("easy"));
      expect(
        await page.evaluate(() =>
          JSON.parse(localStorage.getItem("runset.save.v1")!),
        ),
      ).toEqual(game);
    });
