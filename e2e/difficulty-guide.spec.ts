import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { newGame } from "../src/engine/game";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: difficulty comparison preserves choices and the existing save`, async ({
    page,
  }) => {
    const t = locale === "en" ? (s: string) => s : translator(messages),
      game = newGame("阿明", 1, "easy", 8123);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.emulateMedia({
      colorScheme: locale === "en" ? "light" : "dark",
      reducedMotion: "reduce",
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
      .getByRole("button", { name: t("New game →"), exact: true })
      .click();
    await page.getByText(t("More game options"), { exact: true }).click();
    await page
      .getByLabel(t("What should we call you?"), { exact: true })
      .fill("阿兰");
    await page
      .getByRole("button", { name: `2 ${t("opponents")}`, exact: true })
      .click();
    await page
      .getByLabel(t("Time per turn"), { exact: true })
      .selectOption("120");
    await page.getByText(t("Compare the opponents"), { exact: true }).click();
    await expect(page.locator(".difficulty-guide tbody tr")).toHaveCount(3);
    await expect(
      page
        .locator(".difficulty-guide tbody tr")
        .nth(0)
        .getByLabel(t("No"), { exact: true }),
    ).toHaveCount(2);
    await expect(
      page
        .locator(".difficulty-guide tbody tr")
        .nth(2)
        .getByLabel(t("Yes"), { exact: true }),
    ).toHaveCount(3);
    for (const [title, words] of [
      [
        "A fair match",
        "Try this when you want to practise adding tiles to existing groups and runs. Normal leaves their structure intact.",
      ],
      [
        "Table strategist",
        "Try this when table rearrangements feel familiar. Hard also searches for ways to rebuild the table; a move is not guaranteed every turn.",
      ],
    ]) {
      await page.getByRole("button", { name: new RegExp(t(title)) }).click();
      await expect(page.locator("#difficulty-advice")).toHaveText(t(words));
    }
    await expect(
      page.getByLabel(t("Time per turn"), { exact: true }),
    ).toHaveValue("120");
    await expect(
      page.getByLabel(t("What should we call you?"), { exact: true }),
    ).toHaveValue("阿兰");
    expect(
      await page.evaluate(() =>
        JSON.parse(localStorage.getItem("runset.save.v1")!),
      ),
    ).toEqual(game);
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
    await page.screenshot({
      path: `/tmp/runset-difficulty-${locale}.png`,
      fullPage: true,
    });
    await page
      .getByRole("button", { name: t("Use gentle defaults"), exact: true })
      .click();
    await expect(
      page.getByLabel(t("Time per turn"), { exact: true }),
    ).toHaveValue("0");
    await expect(
      page.getByLabel(t("What should we call you?"), { exact: true }),
    ).toHaveValue("阿兰");
    await page
      .getByRole("button", { name: new RegExp(t("Deal the tiles")) })
      .click();
    await page
      .getByRole("button", { name: t("Start new game"), exact: true })
      .click();
    await expect(page.locator(".table")).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("runset.save.v1")!).players.length,
        ),
      )
      .toBe(2);
    const saved = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("runset.save.v1")!),
    );
    expect(saved.players.find((p: { bot: string | null }) => p.bot)?.bot).toBe(
      "easy",
    );
    expect(
      saved.players.find((p: { bot: string | null }) => !p.bot)?.name,
    ).toBe("阿兰");
    expect(saved.turnSeconds ?? 0).toBe(0);
    expect(saved.coach).toBe(true);
  });
