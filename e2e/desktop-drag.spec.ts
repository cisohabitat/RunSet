import { test, expect } from "@playwright/test";
import { landscapePosition } from "./helpers/landscape";
import { validSave } from "../src/lib/storage";
test("desktop dragging keeps physical tile selections, single snapshots and Undo", async ({
  page,
}) => {
  const game = landscapePosition();
  delete game.match;
  delete game.turnSeconds;
  delete game.deadline;
  game.coach = false;
  await page.setViewportSize({ width: 1180, height: 820 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript((game) => {
    localStorage.setItem("runset.save.v1", JSON.stringify(game));
    localStorage.setItem("runset.language", "en");
  }, game);
  await page.goto("/");
  await page
    .getByRole("button", { name: "Continue game →", exact: true })
    .click();
  for (const id of [3, 4])
    await page.locator(`.rack [data-tile-id="${id}"]`).click();
  await page
    .locator('.rack [data-tile-id="3"]')
    .dragTo(page.locator(".new-meld"));
  const read = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("runset.save.v1")!));
  await expect.poll(async () => (await read()).history?.length).toBe(1);
  const after = await read();
  expect(validSave(after)).toBe(true);
  expect(after.table.at(-1).tiles).toEqual([3, 4]);
  await expect(page.locator('.rack [aria-pressed="true"]')).toHaveCount(0);
  await page.getByRole("button", { name: "Undo move", exact: true }).click();
  await expect
    .poll(async () => (await read()).players[0].rack)
    .toEqual(game.players[0].rack);
  await page
    .locator('.rack [data-tile-id="5"]')
    .dragTo(page.locator(".new-meld"));
  await expect.poll(async () => (await read()).table.at(-1).tiles).toEqual([5]);
  expect(validSave(await read())).toBe(true);
});
