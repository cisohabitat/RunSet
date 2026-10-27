import { test, expect } from "@playwright/test";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: first simple home and secondary tools load offline`, async ({
    page,
    context,
  }) => {
    const t = locale === "en" ? (s: string) => s : translator(messages);
    await page.addInitScript(
      (locale) => localStorage.setItem("runset.language", locale),
      locale,
    );
    await page.goto("/");
    await expect(
      page.getByRole("status").filter({ hasText: t("Ready offline") }),
    ).toBeVisible();
    await context.setOffline(true);
    await page
      .getByRole("button", { name: t("Settings"), exact: true })
      .click();
    await page.getByLabel(t("Simple home screen"), { exact: true }).check();
    await page.keyboard.press("Escape");
    const home = page.locator(".simple-home");
    await expect(home).toBeVisible();
    await home.getByText(t("More options"), { exact: true }).click();
    await expect(
      home.getByRole("button", { name: t("Export game backup"), exact: true }),
    ).toBeDisabled();
    await home
      .getByRole("button", { name: t("Quick exercises"), exact: true })
      .click();
    await expect(page.locator("#main-content")).toContainText(
      t("Quick exercises"),
    );
    await page.getByRole("button", { name: t("Home"), exact: true }).click();
    await page.reload();
    await expect(home).toBeVisible();
    expect(
      await page.evaluate(() => localStorage.getItem("runset.simpleHome")),
    ).toBe("true");
  });
