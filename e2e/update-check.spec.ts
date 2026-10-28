import { test, expect } from "@playwright/test";
test("development update checks explain unavailability without changing play", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Check for updates", exact: true })
    .click();
  await expect(
    page.getByText(
      "Update checks are not available yet. Keep playing and try again.",
      { exact: true },
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "New game →", exact: true }).click();
  await page
    .getByRole("button", { name: "Deal the tiles", exact: false })
    .click();
  await expect(page.locator(".table")).toBeVisible();
});
