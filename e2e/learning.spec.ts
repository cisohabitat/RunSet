import { test, expect } from "@playwright/test";
test("practice gives immediate corrections and highlights the destination", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await page.getByRole("button", { name: "Learn to play" }).click();
  await page
    .getByRole("button", { name: "red 13", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "For this step" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /New group or run/ }).click();
  await expect(
    page.getByRole("status").filter({ hasText: "This exercise uses" }),
  ).toBeVisible();
  await expect(page.locator(".table .tile")).toHaveCount(0);
  await expect(page.locator(".new-meld[data-coach-target=true]")).toBeVisible();
  for (const name of ["red 10", "blue 10", "orange 10"])
    await page.getByRole("button", { name, exact: true }).click();
  await page.getByRole("button", { name: /New group or run/ }).click();
  await expect(page.getByRole("heading", { name: "Make a run" })).toBeVisible();
});
test("a completed lesson leads to a coached real game and explainable hints", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Learn to play" }).click();
  await page.getByRole("button", { name: "Rearranging", exact: true }).click();
  for (const name of ["red 4", "red 5", "red 6", "red 7"])
    await page.getByRole("button", { name, exact: true }).click();
  await page.getByRole("button", { name: /New group or run/ }).click();
  await page
    .getByRole("button", { name: "Play against one Easy opponent" })
    .click();
  await expect(page.getByLabel("First real game guidance")).toBeVisible();
  await page.getByRole("button", { name: "Got it — hide coaching" }).click();
  await expect(page.getByLabel("First real game guidance")).toHaveCount(0);
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page.evaluate(async () => {
    const { practiceGame } = await import("/src/engine/practice.ts");
    localStorage.setItem(
      "runset.save.v1",
      JSON.stringify({ ...practiceGame(), coach: true }),
    );
  });
  await page.reload();
  await page.getByRole("button", { name: "Continue game" }).click();
  await page.getByRole("button", { name: "Show a possible move" }).click();
  await expect(page.getByText("Why this works", { exact: true })).toBeVisible();
  await page.getByText("Why this works", { exact: true }).click();
  await expect(page.locator(".hint-reasons li")).not.toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Place hint", exact: true }),
  ).toBeVisible();
});
