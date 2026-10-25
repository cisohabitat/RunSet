import { test, expect } from "@playwright/test";
test("a deletion reaches other tabs and cannot be resurrected", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const { practiceGame } = await import("/src/engine/practice.ts");
    localStorage.setItem("runset.save.v1", JSON.stringify(practiceGame()));
  });
  await page.reload();
  const other = await context.newPage();
  await other.goto("/");
  await other.getByRole("button", { name: "Continue game" }).click();
  await page
    .getByRole("button", { name: "Delete saved game", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete game", exact: true }).click();
  await expect(
    other.getByRole("button", { name: "Continue game" }),
  ).toHaveCount(0);
  await expect(
    other.getByRole("button", { name: "New game", exact: false }),
  ).toBeVisible();
  expect(
    await other.evaluate(() => localStorage.getItem("runset.save.v1")),
  ).toBeNull();
  await other.reload();
  await expect(
    other.getByRole("button", { name: "Continue game" }),
  ).toHaveCount(0);
});
test("advanced lessons require their full learning objective", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Learn to play" }).click();
  await page.getByRole("button", { name: "Jokers", exact: true }).click();
  await page.getByRole("button", { name: "red 5", exact: true }).click();
  await page
    .getByRole("button", { name: "Add selected tiles to meld 1", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Play against one Easy opponent" }),
  ).toHaveCount(0);
  for (const name of ["Joker representing red 7", "blue 5", "orange 5"])
    await page.getByRole("button", { name, exact: true }).click();
  await page.getByRole("button", { name: /New group or run/ }).click();
  await expect(
    page.getByRole("button", { name: "Play against one Easy opponent" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Rearranging", exact: true }).click();
  await page.getByRole("button", { name: "red 6", exact: true }).click();
  await page
    .getByRole("button", { name: "Add selected tiles to meld 1", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Play against one Easy opponent" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Restart lesson" }).click();
  for (const name of ["red 4", "red 5", "red 6", "red 7"])
    await page.getByRole("button", { name, exact: true }).click();
  await page.getByRole("button", { name: /New group or run/ }).click();
  await expect(
    page.getByRole("button", { name: "Play against one Easy opponent" }),
  ).toBeVisible();
});
test("replacement timer starts when the replacement is confirmed", async ({
  page,
}) => {
  await page.clock.install({ time: new Date() });
  await page.goto("/");
  await page.getByRole("button", { name: "New game", exact: false }).click();
  await page.getByRole("button", { name: "Deal the tiles" }).click();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page.getByRole("button", { name: "New game", exact: false }).click();
  await page.getByLabel("Time per turn").selectOption("60");
  await page.getByRole("button", { name: "Deal the tiles" }).click();
  await page.getByRole("dialog").waitFor();
  await page.clock.fastForward(65000);
  await page
    .getByRole("button", { name: "Start new game", exact: true })
    .click();
  await page.waitForFunction(() => {
    const s = JSON.parse(localStorage.getItem("runset.save.v1")!);
    return s.turnSeconds === 60;
  });
  const state = await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("runset.save.v1")!);
    return { turn: s.turn, remaining: s.deadline - Date.now() };
  });
  expect(state.turn).toBe(1);
  expect(state.remaining).toBeGreaterThan(59000);
});
