import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { landscapePosition } from "./helpers/landscape";
import { validSave } from "../src/lib/storage";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
test.use({ hasTouch: true });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: magnifier explains runs, jokers and drafts without changing play`, async ({
    page,
    context,
  }, info) => {
    const t = locale === "en" ? (s: string) => s : translator(messages),
      game = landscapePosition(),
      now = Date.now();
    delete game.match;
    game.coach = false;
    if (locale === "en") {
      game.turnSeconds = 60;
      game.deadline = now + 60000;
    } else {
      delete game.turnSeconds;
      delete game.deadline;
    }
    game.table[2].tiles = [26, 104, 28];
    game.players[0].rack[game.players[0].rack.indexOf(104)] = 27;
    const longRun = Array.from({ length: 13 }, (_, i) => i + 13);
    game.players.forEach((player) => {
      player.rack = player.rack.filter((id) => !longRun.includes(id));
    });
    game.pool = game.pool.filter((id) => !longRun.includes(id));
    game.table.push({ id: "long-run", tiles: longRun });
    game.turnStart = {
      table: structuredClone(game.table),
      rack: [...game.players[0].rack],
    };
    expect(validSave(game)).toBe(true);
    await page.clock.install({ time: now });
    if (!info.project.name)
      await page.setViewportSize({ width: 375, height: 667 });
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
    await page.goto("/");
    if (info.project.name) {
      await expect(
        page.getByRole("status").filter({ hasText: t("Ready offline") }),
      ).toBeVisible();
      await context.setOffline(true);
      await page.reload();
    }
    await page
      .getByRole("button", { name: t("Continue game →"), exact: true })
      .click();
    await page.locator('.rack [data-tile-id="3"]').click();
    const first = page.getByRole("button", {
      name: `${t("Zoom")} · 1`,
      exact: true,
    });
    const before = await page.locator(".meld").first().boundingBox();
    await first.click();
    const modal = page.getByRole("dialog", {
      name: `${t("Look closer")} · 1`,
      exact: true,
    });
    await expect(modal).toBeVisible();
    await expect(modal.locator(".tile")).toHaveCount(3);
    expect(
      await modal
        .locator(".tile")
        .first()
        .evaluate((el) => ({
          w: el.getBoundingClientRect().width,
          h: el.getBoundingClientRect().height,
        })),
    ).toEqual({ w: 64, h: 88 });
    await expect(modal).toContainText(
      t("Consecutive same-colour run worth 6 points."),
    );
    const close = () =>
      page.getByRole("button", { name: t("Back to table"), exact: true });
    expect(
      await close().evaluate((el) => {
        const r = el.getBoundingClientRect();
        return (
          r.height >= 44 &&
          r.top >= 0 &&
          r.bottom <= innerHeight &&
          el.contains(
            document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
          )
        );
      }),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "best-practice"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.screenshot({
      path: `/tmp/runset-magnifier-${info.project.name || "chromium"}-${locale}.png`,
    });
    await page.keyboard.press("Escape");
    await expect(modal).toHaveCount(0);
    await expect(first).toBeFocused();
    await expect(page.locator('.rack [data-tile-id="3"]')).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      await page.evaluate(() =>
        JSON.parse(localStorage.getItem("runset.save.v1")!),
      ),
    ).toEqual(game);
    expect((await page.locator(".meld").first().boundingBox())?.height).toBe(
      before?.height,
    );
    await page
      .getByRole("button", { name: `${t("Zoom")} · 3`, exact: true })
      .click();
    await expect(
      page.getByRole("dialog").locator(".tile.joker .tile-foot"),
    ).toHaveText(t("blue 2"));
    await close().click();
    await page
      .getByRole("button", { name: `${t("Zoom")} · 7`, exact: true })
      .click();
    const longDialog = page.getByRole("dialog");
    await expect(longDialog.locator(".tile")).toHaveCount(13);
    await longDialog.locator(".tile").last().scrollIntoViewIfNeeded();
    expect(
      await close().evaluate((el) => {
        const r = el.getBoundingClientRect();
        return (
          r.height >= 44 &&
          r.top >= 0 &&
          r.bottom <= innerHeight &&
          el.contains(
            document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
          )
        );
      }),
    ).toBe(true);
    await page.screenshot({
      path: `/tmp/runset-magnifier-long-${info.project.name || "chromium"}-${locale}.png`,
    });
    await close().click();
    await page.locator(".new-meld").click();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("runset.save.v1")!).table.length,
        ),
      )
      .toBe(8);
    const draft = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("runset.save.v1")!),
    );
    await page
      .getByRole("button", { name: `${t("Zoom")} · 8`, exact: true })
      .click();
    await expect(page.getByRole("dialog")).toContainText(
      t("Add 2 more tiles: a group or run needs at least three."),
    );
    await page.setViewportSize({ width: 1180, height: 820 });
    expect(
      await close().evaluate((el) => {
        const r = el.getBoundingClientRect();
        return r.bottom <= innerHeight && r.top >= 0;
      }),
    ).toBe(true);
    await close().click();
    expect(
      await page.evaluate(() =>
        JSON.parse(localStorage.getItem("runset.save.v1")!),
      ),
    ).toEqual(draft);
    await page
      .getByRole("button", { name: `${t("Zoom")} · 8`, exact: true })
      .click();
    if (locale === "en") {
      await page.clock.fastForward(61000);
      await expect(page.locator(".meld-inspector")).toHaveCount(0);
      await expect
        .poll(() =>
          page.evaluate(
            () => JSON.parse(localStorage.getItem("runset.save.v1")!).turn,
          ),
        )
        .toBe(game.turn + 1);
      const next = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("runset.save.v1")!),
      );
      expect(validSave(next)).toBe(true);
      expect(next.table).toEqual(game.table);
    } else {
      await close().click();
      await page
        .getByRole("button", { name: t("Undo move"), exact: true })
        .click();
      await expect
        .poll(() =>
          page.evaluate(
            () => JSON.parse(localStorage.getItem("runset.save.v1")!).table,
          ),
        )
        .toEqual(game.table);
    }
  });
