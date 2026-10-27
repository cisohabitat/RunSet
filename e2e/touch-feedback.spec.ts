import { test, expect, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { landscapePosition } from "./helpers/landscape";
import { reducer } from "../src/engine/game";
import { validSave } from "../src/lib/storage";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
test.use({ hasTouch: true, serviceWorkers: "block" });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: touch selection preview and accepted placement stay distinct from rejection`, async ({
    page,
  }, info) => {
    const t = locale === "en" ? (s: string) => s : translator(messages),
      game = landscapePosition();
    delete game.match;
    delete game.turnSeconds;
    delete game.deadline;
    game.coach = false;
    if (!info.project.name)
      await page.setViewportSize({ width: 375, height: 667 });
    await page.emulateMedia({
      reducedMotion: "reduce",
      colorScheme: locale === "en" ? "light" : "dark",
    });
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.addInitScript(
      ({ game, locale }) => {
        localStorage.setItem("runset.save.v1", JSON.stringify(game));
        localStorage.setItem("runset.language", locale);
      },
      { game, locale },
    );
    const activate = async (locator: Locator) => {
      if (info.project.name === "firefox-desktop") await locator.click();
      else await locator.tap();
    };
    await page.goto("/");
    await page
      .getByRole("button", { name: t("Continue game →"), exact: true })
      .click();
    for (const id of [3, 4])
      await activate(page.locator(`.rack [data-tile-id="${id}"]`));
    await activate(page.locator('.table [data-tile-id="0"]'));
    const preview = page.getByRole("button", {
      name: new RegExp(t("Preview selected tiles")),
    });
    await activate(preview);
    const modal = page.getByRole("dialog", {
      name: t("Selected tiles"),
      exact: true,
    });
    await expect(modal.locator(".tile")).toHaveCount(3);
    expect(
      await modal
        .locator(".tile")
        .evaluateAll((els) =>
          els.map((el) => Number(el.getAttribute("data-tile-id"))),
        ),
    ).toEqual([3, 4, 0]);
    await expect(modal).toContainText(
      t(
        "These are your selected tiles. Close this view, then choose where to place them.",
      ),
    );
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
    await page
      .getByRole("button", { name: t("Back to table"), exact: true })
      .click();
    await expect(preview).toBeFocused();
    const destination = page.getByRole("button", {
      name: t("Add selected tiles to meld 1"),
      exact: true,
    });
    await expect(destination).toHaveAttribute(
      "data-suggested-destination",
      "true",
    );
    await expect(destination).toHaveAttribute(
      "aria-description",
      t("Place 3 selected"),
    );
    await activate(destination);
    const card = page.locator(".meld").first();
    await expect(card).toHaveAttribute("data-placed-destination", "true");
    await expect(card.locator(".meld-target")).toContainText(t("Placed 2"));
    await expect(page.locator(".placement-announcement")).toHaveText(
      t("Placed 2 in group/run 1."),
    );
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("runset.save.v1")!).table[0].tiles
              .length,
        ),
      )
      .toBe(5);
    const saved = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("runset.save.v1")!),
    );
    expect(validSave(saved)).toBe(true);
    expect(saved.history).toHaveLength(1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `/tmp/runset-placement-${info.project.name || "chromium"}-${locale}.png`,
    });
    await page
      .getByRole("button", { name: t("Undo move"), exact: true })
      .click();
    await expect(card).not.toHaveAttribute("data-placed-destination", "true");
    await expect
      .poll(() =>
        page.evaluate(
          () => JSON.parse(localStorage.getItem("runset.save.v1")!).table,
        ),
      )
      .toEqual(game.table);
    for (const id of [3, 4])
      await activate(page.locator(`.rack [data-tile-id="${id}"]`));
    await activate(destination);
    await expect(card).toHaveAttribute("data-placed-destination", "true");
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("runset.save.v1")!).table[0].tiles
              .length,
        ),
      )
      .toBe(5);
    const current = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("runset.save.v1")!),
    );
    const remote = reducer(current, { type: "move", ids: [4], target: "rack" });
    expect(validSave(remote)).toBe(true);
    await page.evaluate((remote) => {
      const raw = JSON.stringify(remote);
      localStorage.setItem("runset.save.v1", raw);
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "runset.save.v1",
          newValue: raw,
          storageArea: localStorage,
        }),
      );
    }, remote);
    await expect(page.locator("[data-placed-destination]")).toHaveCount(0);
    await expect(page.locator(".placement-announcement")).toBeEmpty();
    await page
      .getByRole("button", { name: t("Dismiss notice"), exact: true })
      .click();
    await page
      .getByRole("button", { name: t("Reset turn"), exact: true })
      .click();
    await expect
      .poll(() =>
        page.evaluate(
          () => JSON.parse(localStorage.getItem("runset.save.v1")!).table,
        ),
      )
      .toEqual(game.table);
    await activate(page.locator('.table [data-tile-id="0"]'));
    await page.getByText(t("More"), { exact: true }).click();
    await page
      .getByRole("button", {
        name: t("Return selected tiles to rack"),
        exact: true,
      })
      .click();
    await expect(page.locator(".game-notice")).toContainText(
      t("Table tiles cannot return to your rack."),
    );
    await expect(page.locator('.table [data-tile-id="0"]')).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.locator(".placement-announcement")).toBeEmpty();
    await expect(page.locator("[data-placed-destination]")).toHaveCount(0);
    const rejected = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("runset.save.v1")!),
    );
    expect(rejected.table).toEqual(game.table);
    expect(rejected.players[0].rack).toEqual(game.players[0].rack);
    expect(errors).toEqual([]);
  });
