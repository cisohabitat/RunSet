import { test, expect } from "@playwright/test";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
import { landscapePosition } from "./helpers/landscape";
import { chooseView } from "./helpers/view";

for (const [device, width, height] of [
  ["phone", 360, 640],
  ["iPad", 1180, 820],
  ["desktop", 1440, 900],
] as const)
  for (const locale of ["en", "zh-CN"] as const) {
    test(`${device} ${locale}: quick setup, returning priority and unified views`, async ({
      page,
    }) => {
      const t = locale === "zh-CN" ? translator(messages) : (s: string) => s;
      await page.setViewportSize({ width, height });
      await page.emulateMedia({
        reducedMotion: "reduce",
        colorScheme: device === "iPad" ? "dark" : "light",
      });
      await page.addInitScript(
        (locale) => localStorage.setItem("runset.language", locale),
        locale,
      );
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto("/");
      await expect(page.locator(".hero-actions > .primary")).toContainText(
        t("Learn to play ").trim(),
      );
      await page
        .getByRole("button", { name: t("New game →"), exact: true })
        .click();
      await expect(page.locator(".setup-options")).not.toHaveAttribute(
        "open",
        "",
      );
      const deal = page.locator(".setup form > .primary");
      expect(
        await deal.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return (
            r.top >= 0 &&
            r.bottom <= innerHeight &&
            r.height >= 44 &&
            el.contains(
              document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
            )
          );
        }),
      ).toBe(true);
      await page.screenshot({
        path: `/tmp/runset-premium-setup-${device}-${locale}.png`,
        fullPage: true,
        animations: "disabled",
      });
      await page
        .getByLabel(t("What should we call you?"), { exact: true })
        .fill("   ");
      await deal.click();
      await expect(page.locator(".game")).toBeVisible();
      await expect
        .poll(() =>
          page.evaluate(() => {
            const s = JSON.parse(
              localStorage.getItem("runset.save.v1") || "null",
            );
            return (
              s &&
              s.players.length === 2 &&
              s.players
                .filter((p: any) => p.bot)
                .every((p: any) => p.bot === "easy") &&
              !s.turnSeconds &&
              s.coach
            );
          }),
        )
        .toBe(true);
      await page.getByRole("button", { name: t("Home"), exact: true }).click();
      await expect(page.locator(".hero-actions > .primary")).toHaveText(
        t("Continue game →"),
      );
      await expect(page.locator(".home-save-status")).toHaveText(t("Saved"));
      const name = await page.evaluate(
        () =>
          JSON.parse(localStorage.getItem("runset.save.v1")!).players.find(
            (p: any) => !p.bot,
          ).name,
      );
      expect(name).toBe(locale === "zh-CN" ? "你" : "You");
      await page.evaluate(
        (s) => localStorage.setItem("runset.save.v1", JSON.stringify(s)),
        landscapePosition(),
      );
      await page.reload();
      await page
        .getByRole("button", { name: t("Continue game →"), exact: true })
        .click();
      await expect(page.locator(".table")).toBeVisible();
      const checkShortGuide = async () => {
        if (device !== "phone") return;
        await expect(page.locator(".guide-compact")).toBeVisible();
        expect(
          await page.locator(".first-game-guide p").evaluate((el) => {
            const r = el.getBoundingClientRect(),
              context = el.closest(".game-context")!.getBoundingClientRect();
            return r.top >= context.top && r.bottom <= context.bottom;
          }),
        ).toBe(true);
        await expect(page.getByRole("timer")).toHaveCount(1);
      };
      await checkShortGuide();
      const before = await page.evaluate(() =>
        localStorage.getItem("runset.save.v1"),
      );
      await page.locator('.rack [data-tile-id="3"]').click();
      await checkShortGuide();
      await chooseView(page, "wide", t);
      await chooseView(page, "table", t);
      await expect(page.locator("#player-rack")).toBeHidden();
      await chooseView(page, "wide", t);
      await expect(page.locator('.rack [data-tile-id="3"]')).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await page.keyboard.press("Escape");
      await expect(
        page.getByLabel(t("Table view"), { exact: true }),
      ).toHaveValue("normal");
      await expect(
        page.getByLabel(t("Table view"), { exact: true }),
      ).toBeFocused();
      await checkShortGuide();
      if (device === "phone") {
        await page.locator(".more-actions > summary").click();
        await page.locator(".compact-match-scores > summary").click();
        await expect(page.locator(".compact-match-scores")).toContainText(
          "Juniper: 0",
        );
        await page.locator(".more-actions > summary").click();
      }
      expect(
        await page.evaluate(() => localStorage.getItem("runset.save.v1")),
      ).toBe(before);
      await page.screenshot({
        path: `/tmp/runset-premium-flow-${device}-${locale}.png`,
        animations: "disabled",
      });
      expect(errors).toEqual([]);
    });
  }
