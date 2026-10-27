import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { reviewPosition } from "./helpers/lastPlay";
import { validSave } from "../src/lib/storage";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: latest-play review preserves a changed draft and selection`, async ({
    page,
  }, info) => {
    const t = locale === "en" ? (s: string) => s : translator(messages),
      game = reviewPosition();
    expect(validSave(game)).toBe(true);
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
    await page
      .getByRole("button", { name: t("Continue game →"), exact: true })
      .click();
    await page.locator('.rack [data-tile-id="3"]').click();
    await page.getByText(t("More"), { exact: true }).click();
    const opener = page.getByRole("button", {
      name: t("Review latest play"),
      exact: true,
    });
    await opener.click();
    const dialog = page.getByRole("dialog", {
      name: t("Where the latest tiles landed"),
      exact: true,
    });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(".tile")).toHaveCount(3);
    await expect(dialog.locator(".tile.glow")).toHaveAttribute(
      "data-tile-id",
      "22",
    );
    await expect(
      dialog.getByRole("button", { name: t("Previous tile"), exact: true }),
    ).toBeDisabled();
    for (const id of [48, 74]) {
      await dialog
        .getByRole("button", { name: t("Next tile"), exact: true })
        .click();
      await expect(dialog.locator(".tile.glow")).toHaveAttribute(
        "data-tile-id",
        String(id),
      );
    }
    await expect(
      dialog.getByRole("button", { name: t("Next tile"), exact: true }),
    ).toBeDisabled();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "best-practice"])
          .analyze()
      ).violations,
    ).toEqual([]);
    expect(await dialog.getByRole("button",{name:t("Close review"),exact:true}).evaluate(el=>{const r=el.getBoundingClientRect();return r.height>=44&&r.top>=0&&r.bottom<=innerHeight&&el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));})).toBe(true);
    await page.screenshot({
      path: `/tmp/runset-move-review-${info.project.name || "chromium"}-${locale}.png`,
    });
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(opener).toBeFocused();
    await expect(page.locator('.rack [data-tile-id="3"]')).toHaveClass(
      /selected/,
    );
    expect(
      await page.evaluate(() =>
        JSON.parse(localStorage.getItem("runset.save.v1")!),
      ),
    ).toEqual(game);
    await page.reload();
    await page
      .getByRole("button", { name: t("Continue game →"), exact: true })
      .click();
    await page.getByText(t("More"), { exact: true }).click();
    await page
      .getByRole("button", { name: t("Review latest play"), exact: true })
      .click();
    await expect(page.getByRole("dialog")).toBeVisible();
    expect(
      await page.evaluate(() =>
        JSON.parse(localStorage.getItem("runset.save.v1")!),
      ),
    ).toEqual(game);
  });
