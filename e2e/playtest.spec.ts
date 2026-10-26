import { test, expect } from "@playwright/test";

for (const large of [false, true]) {
  test(`short laptop retains a full meld with Hint open (large tiles: ${large})`, async ({ page }) => {
    await page.setViewportSize({ width: 1180, height: 757 });
    await page.goto("/");
    await page.evaluate(async large => {
      const { practiceGame } = await import("/src/engine/practice.ts");
      const s = practiceGame();
      s.table = [{ id: "tens", tiles: [9, 35, 61] }, { id: "run", tiles: [0, 1, 2] }];
      s.players[0].rack = [12];
      s.players[0].melded = true;
      const used = new Set([12, ...s.table.flatMap(m => m.tiles)]);
      const rest = Array.from({ length: 106 }, (_, i) => i).filter(id => !used.has(id));
      s.players[1].rack = rest.splice(0, 14);
      s.pool = rest;
      s.turnStart = { table: structuredClone(s.table), rack: [12] };
      localStorage.setItem("runset.save.v1", JSON.stringify(s));
      localStorage.setItem("runset.largeTiles", String(large));
    }, large);
    await page.reload();
    await page.getByRole("button", { name: /Continue game/ }).click();
    await page.getByRole("button", { name: "Show a possible move" }).click();
    await expect(page.getByLabel("Move hint", { exact: true })).toBeVisible();
    const checkBoard = async () => {
      const bounds = await page.locator(".table").evaluate(el => {
        const r = el.getBoundingClientRect(), meld = el.querySelector(".meld")!.getBoundingClientRect();
        const dock = document.querySelector(".player-dock")!.getBoundingClientRect();
        return { height: r.height, meldTop: meld.top, meldBottom: meld.bottom, top: r.top, bottom: r.bottom, dockTop: dock.top };
      });
      expect(bounds.height).toBeGreaterThanOrEqual(220);
      expect(bounds.meldTop).toBeGreaterThanOrEqual(bounds.top);
      expect(bounds.meldBottom).toBeLessThanOrEqual(bounds.bottom);
      expect(bounds.bottom).toBeLessThanOrEqual(bounds.dockTop);
      expect(await page.getByRole("button", { name: /Draw a tile/ }).evaluate(el => el.getBoundingClientRect().bottom <= innerHeight)).toBe(true);
      return bounds.height;
    };
    const before = await checkBoard();
    expect(await page.locator(".game-heading").evaluate(el => {
      const r = el.getBoundingClientRect(), context = el.closest(".game-context")!.getBoundingClientRect();
      return r.top >= context.top && r.bottom <= context.bottom;
    })).toBe(true);
    await page.screenshot({ path: `/tmp/runset-playtest-laptop-${large}.png`, animations: "disabled" });
    await page.getByRole("button", { name: "Expand table", exact: true }).click();
    expect(await checkBoard()).toBeGreaterThanOrEqual(before);
    await page.getByRole("button", { name: "Compact table", exact: true }).click();
    await checkBoard();
    await page.getByRole("button", { name: "Dismiss hint", exact: true }).click();
    await expect(page.locator(".opponents")).toBeVisible();
  });
}

for (const [device, width, height] of [["phone", 375, 667], ["laptop", 1180, 757]] as const) {
  test(`${device}: optional lessons explain the joker step and preserve the finished table`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await page.getByRole("button", { name: /Learn to play/ }).click();
    await page.getByRole("button", { name: "Jokers", exact: true }).click();
    await page.getByRole("button", { name: "red 5", exact: true }).click();
    await page.getByRole("button", { name: "Add selected tiles to meld 1" }).click();
    await expect(page.getByRole("heading", { name: "Reuse the table joker", exact: true })).toBeVisible();
    await expect(page.locator("#practice-instructions")).toContainText("red 7");
    await expect(page.locator("#practice-instructions")).toContainText("still on the table");
    for (const name of ["Joker representing red 7", "blue 5", "orange 5"])
      await page.getByRole("button", { name, exact: true }).click();
    await page.getByRole("button", { name: /New group or run/ }).click();
    await expect(page.getByRole("heading", { name: "Joker lesson complete", exact: true })).toBeVisible();
    const result = page.getByRole("region", { name: "Completed lesson table", exact: true });
    await expect(result.locator(".tile")).toHaveCount(6);
    await expect(result.locator(".tile:not(:disabled)")).toHaveCount(0);
    await page.reload();
    await page.getByRole("button", { name: /Learn to play/ }).click();
    await expect(page.getByRole("heading", { name: "Joker lesson complete", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Restart lesson", exact: true }).click();
    await expect(result).toHaveCount(0);
    await page.getByRole("button", { name: "Rearranging", exact: true }).click();
    for (const name of ["red 4", "red 5", "red 6", "red 7"])
      await page.getByRole("button", { name, exact: true }).click();
    await page.getByRole("button", { name: /New group or run/ }).click();
    await expect(page.getByRole("heading", { name: "Run-splitting lesson complete", exact: true })).toBeVisible();
    await expect(result.locator(".tile")).toHaveCount(7);
    await expect(page.getByRole("button", { name: /Play against one Easy/ })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("runset.save.v1"))).toBeNull();
    await page.screenshot({ path: `/tmp/runset-playtest-completed-${device}.png`, fullPage: true, animations: "disabled" });
  });
}

test("empty-pool hint, coaching and timer agree with the Pass action", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const { practiceGame } = await import("/src/engine/practice.ts");
    const s = practiceGame();
    s.players[0].rack = [12];
    s.players[0].melded = true;
    s.players[1].rack = Array.from({ length: 106 }, (_, i) => i).filter(id => id !== 12);
    s.pool = [];
    s.turnStart = { table: [], rack: [12] };
    s.coach = true;
    s.turnSeconds = 120;
    s.deadline = Date.now() + 120000;
    localStorage.setItem("runset.save.v1", JSON.stringify(s));
  });
  await page.reload();
  await page.getByRole("button", { name: /Continue game/ }).click();
  await expect(page.getByRole("timer")).toContainText("pass");
  await expect(page.getByLabel("First real game guidance")).toContainText("or pass");
  await page.getByRole("button", { name: "Show a possible move" }).click();
  const hint = page.getByLabel("Move hint", { exact: true });
  await expect(hint).toContainText("pool is empty");
  await expect(hint).toContainText("pass");
  await expect(hint).not.toContainText(/\bdraw\b/i);
  await page.getByRole("button", { name: /^Pass/ }).click();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem("runset.save.v1")!).passes)).toBe(1);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("runset.save.v1")!).players[0].rack)).toEqual([12]);
});
