import { test, expect } from "@playwright/test";
import { practiceGame } from "../src/engine/practice";
import { reducer } from "../src/engine/game";
import { exportBackup } from "../src/lib/backup";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: backup review distinguishes restoring from a fresh deal and preserves the original deadline`, async ({
    page,
  }) => {
    const t = locale === "en" ? (s: string) => s : translator(messages),
      current = practiceGame("rearrange"),
      incoming = reducer(practiceGame(), {
        type: "move",
        ids: [9, 35, 61],
        target: "new",
      });
    incoming.turnSeconds = 120;
    incoming.deadline = Date.now() + 120000;
    await page.addInitScript(
      ({ current, locale }) => {
        localStorage.setItem("runset.save.v1", JSON.stringify(current));
        localStorage.setItem("runset.language", locale);
        localStorage.setItem("runset.muted", "true");
      },
      { current, locale },
    );
    await page.goto("/");
    const before = await page.evaluate(() =>
      localStorage.getItem("runset.save.v1"),
    );
    const upload = () =>
      page
        .getByLabel(t("Import game backup"), { exact: true })
        .setInputFiles({
          name: "saved-turn.json",
          mimeType: "application/json",
          buffer: Buffer.from(exportBackup(incoming)),
        });
    await upload();
    const dialog = page.getByRole("dialog", {
      name: t("Restore this backup?"),
      exact: true,
    });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: t("Restore backup"), exact: true }),
    ).toBeVisible();
    await expect(
      dialog.getByRole("button", { name: t("Start new game"), exact: true }),
    ).toHaveCount(0);
    await expect(dialog).toContainText(
      t(
        "The backup has been validated. Saved games keep their original turn and timer.",
      ),
    );
    await dialog
      .getByRole("button", { name: t("Keep game"), exact: true })
      .click();
    expect(
      await page.evaluate(() => localStorage.getItem("runset.save.v1")),
    ).toBe(before);
    await upload();
    await dialog
      .getByRole("button", { name: t("Restore backup"), exact: true })
      .click();
    await expect(page.locator(".rack")).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() =>
          JSON.parse(localStorage.getItem("runset.save.v1")!),
        ),
      )
      .toEqual(incoming);
  });
