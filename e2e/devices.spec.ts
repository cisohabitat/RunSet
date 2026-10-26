import { test, expect } from "@playwright/test";
test("primary controls stay visible without covering the table", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const { practiceGame } = await import("/src/engine/practice.ts");
    localStorage.setItem("runset.save.v1", JSON.stringify(practiceGame()));
  });
  await page.reload();
  await page.getByRole("button", { name: "Continue game" }).click();
  await expect(page.locator(".table")).toBeVisible();
  for (const [width, height] of [
    [360, 800],
    [375, 667],
    [390, 844],
    [430, 932],
    [768, 1024],
    [820, 1180],
    [1180, 820],
    [1440, 900],
  ]) {
    await page.setViewportSize({ width, height });
    const bounds = await page.evaluate(() => {
      const table = document.querySelector(".table")!.getBoundingClientRect(),
        dock = document.querySelector(".player-dock")!.getBoundingClientRect();
      return {
        overlap: Math.max(0, table.bottom - dock.top),
        height: table.height,
        scroll: document.documentElement.scrollWidth,
        viewport: innerWidth,
      };
    });
    expect(bounds.overlap).toBeLessThanOrEqual(1);
    expect(bounds.height).toBeGreaterThanOrEqual(80);
    expect(bounds.scroll).toBeLessThanOrEqual(bounds.viewport);
    await expect(
      page.getByRole("button", { name: "Draw a tile" }),
    ).toBeInViewport();
    await expect(
      page.getByRole("button", { name: "End turn →", exact: true }),
    ).toBeInViewport();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "/tmp/runset-phase2-phone.png" });
  await page.getByRole("button", { name: "red 10", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("button", { name: "blue 10", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Space");
  await page.keyboard.press("n");
  await expect(page.locator(".table .tile")).toHaveCount(1);
  await page.keyboard.press("Control+z");
  await expect(page.locator(".table .tile")).toHaveCount(0);
  await page.getByLabel("Game menu", { exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Delete saved game", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Delete saved game", exact: true }),
  ).not.toBeVisible();
});
