import { test, expect } from "@playwright/test";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: first-game guidance follows selection, points and safe resets`, async ({
    page,
  }) => {
    const t = locale === "zh-CN" ? translator(messages) : (s: string) => s;
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    await page.evaluate(async (locale) => {
      const { practiceGame } = await import("/src/engine/practice.ts");
      localStorage.setItem(
        "runset.save.v1",
        JSON.stringify({ ...practiceGame(), coach: true }),
      );
      localStorage.setItem("runset.language", locale);
    }, locale);
    await page.reload();
    await page
      .getByRole("button", { name: t("Continue game →"), exact: true })
      .click();
    const checkGuide = async () => {
      expect(
        await page.locator(".first-game-guide p").evaluate((el) => {
          const r = el.getBoundingClientRect(),
            context = el.closest(".game-context")!.getBoundingClientRect();
          return r.top >= context.top && r.bottom <= context.bottom;
        }),
      ).toBe(true);
    };
    await checkGuide();
    const end = page.getByRole("button", {
        name: t("End turn →"),
        exact: true,
      }),
      help = page.locator("#end-turn-help");
    await expect(end).toBeDisabled();
    await expect(end).toHaveAttribute("aria-describedby", "end-turn-help");
    await expect(help).toHaveText(
      t(
        "End turn is unavailable until you play a rack tile. You can draw a tile instead.",
      ),
    );
    for (const id of [9, 35, 61])
      await page.locator(`.rack [data-tile-id="${id}"]`).click();
    await expect(page.locator(".new-meld")).toHaveAttribute(
      "data-suggested-destination",
      "true",
    );
    await expect(page.locator(".first-game-guide")).toContainText(
      t(
        "3 tiles selected. Choose an outlined destination. End turn will check the whole table before finishing.",
      ),
    );
    await checkGuide();
    await page.screenshot({
      path: `/tmp/runset-guidance-step-${locale}.png`,
      animations: "disabled",
    });
    await page.locator(".new-meld").click();
    await expect(end).toBeEnabled();
    await expect(help).toHaveText(
      t(
        "Ready to end: every group and run is valid, and you played from your rack.",
      ),
    );
    await page
      .getByRole("button", { name: t("Reset turn"), exact: true })
      .click();
    for (const id of [0, 1, 2])
      await page.locator(`.rack [data-tile-id="${id}"]`).click();
    await page.locator(".new-meld").click();
    await expect(page.locator(".first-game-guide")).toContainText(
      t(
        "Your opening is 6 / 30 points. Add more tiles from your own rack, or Reset for free.",
      ),
    );
    await page
      .getByRole("button", { name: t("Reset turn"), exact: true })
      .click();
    await page.locator('.rack [data-tile-id="12"]').click();
    await page.locator(".new-meld").click();
    await expect(help).toHaveText(
      t(
        "Ending now restores this turn and draws up to 3 penalty tiles. Keep editing, or Reset for free.",
      ),
    );
    await page
      .getByRole("button", { name: t("+3 tiles · End turn"), exact: true })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page
      .getByRole("button", { name: t("Keep editing"), exact: true })
      .click();
    await page
      .getByRole("button", { name: t("Reset turn"), exact: true })
      .click();
    await expect(page.locator(".rack .tile")).toHaveCount(14);
    await page.getByText(t("More"), { exact: true }).click();
    await page
      .getByText(t("Reset, Draw and Pass explained"), { exact: true })
      .click();
    await expect(page.locator(".turn-actions-help")).toContainText(
      t(
        "Reset puts this turn back as it was. You keep your turn and draw no penalty tiles.",
      ),
    );
    await page.screenshot({
      path: `/tmp/runset-guidance-${locale}.png`,
      fullPage: true,
      animations: "disabled",
    });
  });
test("new-game guidance defaults on and can be declined", async ({ page }) => {
  for (const coach of [true, false]) {
    await page.goto("/");
    await page.getByRole("button", { name: /New game/ }).click();
    const option = page.getByLabel("Show first-game guidance", { exact: true });
    await expect(option).toBeChecked();
    if (!coach) await option.uncheck();
    await page.getByRole("button", { name: /Deal the tiles/ }).click();
    if (!coach)
      await page
        .getByRole("button", { name: "Start new game", exact: true })
        .click();
    await page.getByRole("button", { name: "Home", exact: true }).click();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("runset.save.v1")!).coach === true,
        ),
      )
      .toBe(coach);
  }
});
test("empty pool gives an explicit Pass explanation for unavailable End", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const { practiceGame } = await import("/src/engine/practice.ts");
    const s = practiceGame();
    s.players[1].rack.push(...s.pool.splice(0));
    s.coach = true;
    localStorage.setItem("runset.save.v1", JSON.stringify(s));
  });
  await page.reload();
  await page.getByRole("button", { name: /Continue game/ }).click();
  await expect(page.locator("#end-turn-help")).toContainText("pass instead");
  await expect(page.locator("#end-turn-help")).not.toContainText("draw");
  await expect(page.getByRole("button", { name: /^Pass/ })).toBeEnabled();
});
