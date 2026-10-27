import { test, expect } from "@playwright/test";
import { landscapePosition } from "./helpers/landscape";
test.use({
  hasTouch: true,
  viewport: { width: 375, height: 667 },
  serviceWorkers: "block",
});
test("completed taps place once; scrolling and cancelled touches preserve selection; keyboard and mouse still work", async ({
  page,
}) => {
  const game = landscapePosition(true);
  delete game.match;
  delete game.turnSeconds;
  delete game.deadline;
  game.coach = false;
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript((game) => {
    localStorage.setItem("runset.save.v1", JSON.stringify(game));
    localStorage.setItem("runset.language", "zh-CN");
    localStorage.setItem("runset.reading", "true");
  }, game);
  await page.goto("/");
  await page.getByRole("button", { name: "继续游戏 →", exact: true }).tap();
  const tile = page.locator('.rack [data-tile-id="3"]'),
    destination = page.locator(".new-meld"),
    undo = page.getByRole("button", { name: "撤销上一步", exact: true });
  const history = () =>
    page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("runset.save.v1")!).history?.length ??
        0,
    );
  await tile.tap();
  await expect(tile).toHaveAttribute("aria-pressed", "true");
  await destination.tap();
  await expect.poll(history).toBe(1);
  await undo.tap();
  await expect.poll(history).toBe(0);
  await tile.tap();
  await expect(tile).toHaveAttribute("aria-pressed", "true");
  await destination.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() =>
    localStorage.getItem("runset.save.v1"),
  );
  const r = (await destination.boundingBox())!,
    x = r.x + r.width / 2,
    y = r.y + r.height / 2;
  const cdp = await page.context().newCDPSession(page);
  const send = (
    type: "touchStart" | "touchMove" | "touchEnd" | "touchCancel",
    px = x,
  ) =>
    cdp.send("Input.dispatchTouchEvent", {
      type,
      touchPoints:
        type === "touchEnd" || type === "touchCancel" ? [] : [{ x: px, y }],
    });
  await send("touchStart");
  await send("touchMove", x + 20);
  await send("touchMove");
  await send("touchEnd");
  expect(await history()).toBe(0);
  await expect(tile).toHaveAttribute("aria-pressed", "true");
  await send("touchStart");
  await send("touchCancel");
  await cdp.detach();
  expect(
    await page.evaluate(() => localStorage.getItem("runset.save.v1")),
  ).toBe(before);
  await destination.press("Enter");
  await expect.poll(history).toBe(1);
  await undo.click();
  await expect.poll(history).toBe(0);
  await tile.click();
  await expect(tile).toHaveAttribute("aria-pressed", "true");
  await destination.click();
  await expect.poll(history).toBe(1);
});
