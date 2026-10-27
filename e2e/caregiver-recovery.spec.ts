import { test, expect } from "@playwright/test";
test.use({ serviceWorkers: "block" });
test("guide keeps a readable language failure inside Settings and retains English", async ({
  page,
}) => {
  await page.route(/zh-CN.*\.(?:js|ts)(?:\?|$)/, (route) =>
    route.abort("failed"),
  );
  await page.goto("/");
  const settings = page.getByRole("button", { name: "Settings", exact: true });
  await settings.click();
  const dialog = page.locator(".settings-dialog");
  await dialog.locator(".caregiver-guide summary").click();
  const language = dialog.getByLabel("语言 / Language");
  await language.selectOption("zh-CN");
  await expect(dialog.getByRole("alert")).toContainText(
    "Chinese could not load",
  );
  await expect(language).toBeEnabled();
  await expect(language).toHaveValue("en");
  await expect(
    dialog.getByRole("button", {
      name: "Choose display settings",
      exact: true,
    }),
  ).toBeEnabled();
  await page.keyboard.press("Escape");
  await expect(settings).toBeFocused();
  await expect(page.locator("#main-content")).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("runset.language")),
  ).toBe("en");
});
