import { test, expect, type Locator } from "@playwright/test";
import { landscapePosition } from "../e2e/helpers/landscape";
import { tiles } from "../src/engine/tiles";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: manual rack arrangement is offline, durable and independent of the game`, async ({
    page,
    context,
  }, info) => {
    const t = locale === "en" ? (s: string) => s : translator(messages),
      game = landscapePosition(true);
    delete game.match;
    delete game.turnSeconds;
    delete game.deadline;
    game.coach = false;
    await page.emulateMedia({
      colorScheme: locale === "en" ? "light" : "dark",
      reducedMotion: "reduce",
    });
    await page.addInitScript(
      ({ game, locale }) => {
        if (sessionStorage.getItem("rack-seeded")) return;
        sessionStorage.setItem("rack-seeded", "1");
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
    await page.goto("/");
    await expect(
      page.getByRole("status").filter({ hasText: t("Ready offline") }),
    ).toBeVisible();
    await context.setOffline(true);
    const resume = async () => {
      await activate(
        page.getByRole("button", { name: t("Continue game →"), exact: true }),
      );
      await expect(page.locator(".rack-tiles")).toBeVisible();
    };
    await resume();
    await activate(page.locator('.rack [data-tile-id="4"]'));
    const before = await page.evaluate(() =>
      localStorage.getItem("runset.save.v1"),
    );
    const order = () =>
      page
        .locator(".rack-tiles > .tile")
        .evaluateAll((els) =>
          els.map((el) => Number(el.getAttribute("data-tile-id"))),
        );
    const original = await order();
    const open = async () => {
      await activate(page.locator(".more-actions > summary"));
      await activate(
        page.getByRole("button", { name: t("Arrange rack"), exact: true }),
      );
    };
    await open();
    const panel = page.getByRole("dialog", {
      name: t("Arrange rack"),
      exact: true,
    });
    await panel.locator(".tile").last().scrollIntoViewIfNeeded();
    const keepBounds = await panel
      .getByRole("button", { name: t("Keep order"), exact: true })
      .boundingBox();
    expect(keepBounds!.height).toBeGreaterThanOrEqual(48);
    expect(keepBounds!.y + keepBounds!.height).toBeLessThanOrEqual(
      await page.evaluate(() => innerHeight),
    );
    await page.screenshot({path:`/tmp/runset-arrange-panel-${info.project.name}-${locale}.png`});
    await activate(panel.locator('[data-tile-id="4"]'));
    await activate(
      panel.getByRole("button", { name: t("Move left"), exact: true }),
    );
    await activate(
      panel.getByRole("button", { name: t("Keep order"), exact: true }),
    );
    await expect(panel).not.toBeVisible();
    await expect(page.locator('.rack [data-tile-id="4"]')).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    const expected = [4, 3, ...original.slice(2)];
    await expect.poll(order).toEqual(expected);
    expect(
      await page.evaluate(() => localStorage.getItem("runset.save.v1")),
    ).toBe(before);
    await page.keyboard.press("Escape");
    await page.reload();
    await resume();
    await expect.poll(order).toEqual(expected);
    await open();
    await activate(panel.locator('[data-tile-id="4"]'));
    await activate(
      panel.getByRole("button", { name: t("Move right"), exact: true }),
    );
    await page.keyboard.press("Escape");
    await expect.poll(order).toEqual(expected);
    await activate(page.locator(".more-actions > summary"));
    await activate(page.locator('.rack [data-tile-id="3"]'));
    await expect(page.locator('.rack [data-tile-id="3"]')).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await activate(page.locator(".new-meld"));
    await expect(
      page.getByRole("button", { name: t("Undo move"), exact: true }),
    ).toBeEnabled();
    await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem("runset.save.v1")!).history?.length)).toBe(1);
    await activate(
      page.getByRole("button", { name: t("Undo move"), exact: true }),
    );
    await expect.poll(order).toEqual(expected);
    await activate(page.locator(".more-actions > summary"));
    await activate(
      page.getByRole("button", { name: t("Number"), exact: true }).last(),
    );
    expect(
      await page.evaluate(
        () => JSON.parse(localStorage.getItem("runset.rackOrder.v1")!).mode,
      ),
    ).toBe("number");
    expect(await order()).toEqual(
      [...game.players[0].rack].sort(
        (a, b) => tiles[a].num - tiles[b].num || a - b,
      ),
    );
    await page.screenshot({
      path: `/tmp/runset-rack-order-${info.project.name}-${locale}.png`,
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
