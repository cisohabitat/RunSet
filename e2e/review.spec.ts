import { test, expect } from "@playwright/test";

test("a placed hint reloads safely and Undo restores the exact pre-hint table", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const { practiceGame } = await import("/src/engine/practice.ts");
    localStorage.setItem("runset.save.v1", JSON.stringify(practiceGame()));
  });
  await page.reload();
  await page.getByRole("button", { name: /Continue game/ }).click();
  await page.getByRole("button", { name: "Show a possible move" }).click();
  await page.getByRole("button", { name: "Place hint", exact: true }).click();
  const tileCount = await page.locator(".table .tile").count();
  expect(tileCount).toBeGreaterThan(0);
  await expect(page.getByText("Saved", { exact: true })).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: /Continue game/ }).click();
  await expect(page.locator(".table .tile")).toHaveCount(tileCount);
  await page.getByRole("button", { name: "Undo move", exact: true }).click();
  await expect(page.locator(".table .tile")).toHaveCount(0);
  await expect(page.locator(".rack .tile")).toHaveCount(14);
});

test("tutorial rejects incorrect destinations while allowing partial groups", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Learn to play/ }).click();
  await page.getByRole("button", { name: "red 10", exact: true }).click();
  await page.getByRole("button", { name: /New group or run/ }).click();
  for (const name of ["blue 10", "orange 10"])
    await page.getByRole("button", { name, exact: true }).click();
  await page.getByRole("button", { name: "Add selected tiles to meld 1" }).click();
  await expect(page.getByRole("heading", { name: "Make a run", exact: true })).toBeVisible();
  for (const name of ["red 1", "red 2", "red 3"])
    await page.getByRole("button", { name, exact: true }).click();
  await page.getByRole("button", { name: "Add selected tiles to meld 1" }).click();
  await expect(page.locator(".table .tile")).toHaveCount(3);
  await expect(page.getByRole("status").filter({ hasText: "outlined destination" })).toBeVisible();
  await page.getByRole("button", { name: "Jokers", exact: true }).click();
  await page.getByRole("button", { name: "red 5", exact: true }).click();
  await page.getByRole("button", { name: /New group or run/ }).click();
  await expect(page.locator(".table .tile")).toHaveCount(3);
  await expect(page.getByRole("status").filter({ hasText: "outlined destination" })).toBeVisible();
});

test("phone controls remain fully reachable with a match, timer, coaching and large tiles", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await page.evaluate(async () => {
    const { practiceGame } = await import("/src/engine/practice.ts");
    const game = practiceGame();
    game.coach = true;
    game.match = { target: 500, round: 1, totals: [0, 0], rounds: [] };
    game.turnSeconds = 120;
    game.deadline = Date.now() + 120000;
    localStorage.setItem("runset.save.v1", JSON.stringify(game));
    localStorage.setItem("runset.largeTiles", "true");
  });
  await page.reload();
  await page.getByRole("button", { name: /Continue game/ }).click();
  const checkControls = async () => {
    const result = await page.getByRole("button", { name: /Draw a tile/ }).evaluate(el => {
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: r.bottom, viewport: innerHeight };
    });
    expect(result.top).toBeGreaterThanOrEqual(0);
    expect(result.bottom).toBeLessThanOrEqual(result.viewport);
  };
  for (const [width, height] of [[360, 640], [375, 667], [390, 844], [820, 1180], [1180, 820], [1440, 900]]) {
    await page.setViewportSize({ width, height });
    await checkControls();
  }
  await page.setViewportSize({ width: 375, height: 667 });
  await page.getByRole("button", { name: "red 10", exact: true }).click();
  await checkControls();
  await page.getByRole("button", { name: "Show a possible move" }).click();
  await expect(page.getByLabel("Move hint", { exact: true })).toBeVisible();
  await checkControls();
});

test("an older hint save recovers its current position with an explicit notice", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const { practiceGame } = await import("/src/engine/practice.ts");
    const { reducer } = await import("/src/engine/game.ts");
    const s = reducer(practiceGame(), { type: "move", ids: [9, 35, 61], target: "new" });
    s.history.push({ table: structuredClone(s.table), rack: [...s.turnStart.rack] });
    localStorage.setItem("runset.save.v1", JSON.stringify(s));
  });
  await page.reload();
  await expect(page.getByRole("status").filter({ hasText: "damaged Undo history" })).toBeVisible();
  await page.getByRole("button", { name: /Continue game/ }).click();
  await expect(page.locator(".table .tile")).toHaveCount(3);
  await expect(page.locator(".rack .tile")).toHaveCount(11);
  await expect(page.getByText("Saved", { exact: true })).toBeVisible();
});
