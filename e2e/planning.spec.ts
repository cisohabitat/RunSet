import { test, expect } from "@playwright/test";
test("slow worker startup does not block controls or exhaust search time", async ({
  page,
  context,
}) => {
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.route("**/src/workers/planner.ts*", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    await route.continue();
  });
  await page.goto("/");
  await page.evaluate(async () => {
    const { practiceGame } = await import("/src/engine/practice.ts");
    localStorage.setItem("runset.save.v1", JSON.stringify(practiceGame()));
  });
  await page.reload();
  await page.getByRole("button", { name: "Continue game" }).click();
  await page.getByRole("button", { name: "Show a possible move" }).click();
  const start = Date.now();
  await page.getByLabel("Game menu", { exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Delete saved game", exact: true }),
  ).toBeVisible({ timeout: 1500 });
  const duration = Date.now() - start;
  expect(duration).toBeLessThan(1500);
  console.log(
    `Menu response with 4x CPU throttle and a delayed worker: ${duration} ms`,
  );
  await page.getByLabel("Game menu", { exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Place hint", exact: true }),
  ).toBeVisible({ timeout: 12000 });
  await expect(page.getByRole("heading", { name: "Your move." })).toBeVisible();
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
});
