import { test, expect } from "@playwright/test";
import { newGame } from "../src/engine/game";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
for (const locale of ["en", "zh-CN"] as const) {
  test(`${locale}: named turn and multi-opponent reminder preserve the save`, async ({
    page,
  }) => {
    const t = locale === "en" ? (s: string) => s : translator(messages);
    const game = newGame("阿明", 3, "easy", 8123, { coach: true });
    game.current = 1;
    game.turnStart = {
      table: structuredClone(game.table),
      rack: [...game.players[1].rack],
    };
    await page.clock.install();
    await page.setViewportSize({ width: 375, height: 667 });
    await page.addInitScript(
      ({ game, locale }) => {
        localStorage.setItem("runset.save.v1", JSON.stringify(game));
        localStorage.setItem("runset.language", locale);
      },
      { game, locale },
    );
    await page.goto("/");
    await page
      .getByRole("button", { name: t("Continue game →"), exact: true })
      .click();
    await expect(page.getByRole("heading", {name:t(`${game.players[1].name} is playing.`),exact:true})).toBeVisible();
    await expect(page.locator(".turn-owner")).toHaveText(
      t(`${game.players[1].name}’s turn`),
    );
    await expect(page.locator(".guide-compact")).toHaveText(
      t(
        "3 opponents will play before you. Watch their moves; your tiles unlock on your turn.",
      ),
    );
    await page.getByText(t("More"), { exact: true }).click();
    await page.getByText(t("What can I do now?"), { exact: true }).click();
    await expect(page.locator(".current-turn-help")).toContainText(
      t("Wait for your turn before playing tiles."),
    );
    expect(
      await page.evaluate(() =>
        JSON.parse(localStorage.getItem("runset.save.v1")!),
      ),
    ).toEqual(game);
  });
  test(`${locale}: next-action help remains after coaching is dismissed`, async ({
    page,
  }) => {
    const t = locale === "en" ? (s: string) => s : translator(messages);
    const game = newGame("阿明", 1, "easy", 8123, { coach: false });
    game.log = ["Moss drew a tile."];
    await page.addInitScript(
      ({ game, locale }) => {
        localStorage.setItem("runset.save.v1", JSON.stringify(game));
        localStorage.setItem("runset.language", locale);
      },
      { game, locale },
    );
    await page.goto("/");
    await page
      .getByRole("button", { name: t("Continue game →"), exact: true })
      .click();
    await expect(page.locator(".turn-owner")).toHaveText(t("Your turn"));
    await page.getByText(t("More"), { exact: true }).click();
    await page.getByText(t("What can I do now?"), { exact: true }).click();
    await expect(page.locator(".current-turn-help")).toContainText(
      t("Moss drew a tile."),
    );
    await expect(page.locator(".current-turn-help")).toContainText(
      t(
        "End turn is unavailable until you play a rack tile. You can draw a tile instead.",
      ),
    );
    expect(
      await page.evaluate(() =>
        JSON.parse(localStorage.getItem("runset.save.v1")!),
      ),
    ).toEqual(game);
  });
}
