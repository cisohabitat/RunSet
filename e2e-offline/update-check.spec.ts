import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { verifyUpdateCheck } from "../e2e/helpers/update-check";
import { landscapePosition } from "../e2e/helpers/landscape";
test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: update checks preserve timed drafts and offline Undo`, ({
    page,
    context,
  }, info) => verifyUpdateCheck(page, context, info, locale));
test("a failed optional offline-tools chunk leaves Home and the unfinished game usable", async ({
  page,
  context,
}) => {
  const game = landscapePosition(),
    raw = JSON.stringify(game);
  await page.addInitScript(
    (raw) => localStorage.setItem("runset.save.v1", raw),
    raw,
  );
  await context.route("**/assets/OfflinePanel-*.js", (r) => r.abort());
  await page.goto("/");
  await expect(
    page.getByRole("status").filter({
      hasText:
        "Offline tools could not open. You can keep playing in this tab.",
    }),
  ).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page
    .getByRole("button", { name: "Continue game →", exact: true })
    .click();
  await expect(page.locator(".table")).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "This screen could not open.",
      exact: true,
    }),
  ).toHaveCount(0);
  expect(
    await page.evaluate(() => localStorage.getItem("runset.save.v1")),
  ).toBe(raw);
  await page.locator('.rack [data-tile-id="3"]').tap();
  await page.locator(".new-meld").tap();
  await expect(page.locator('.table [data-tile-id="3"]')).toBeVisible();
  await page.getByRole("button", { name: "Undo move", exact: true }).click();
  await expect(page.locator('.rack [data-tile-id="3"]')).toBeVisible();
});
