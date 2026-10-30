import { expect, type Locator, type Page } from "@playwright/test";

export async function verifyTileMarkings(
  page: Page,
  t: (s: string) => string,
  activate: (target: Locator) => Promise<void>,
) {
  const before = await page.evaluate(() => localStorage.getItem("runset.save.v1"));
  const selected = await page.locator("main.game .tile.selected").evaluateAll(els => els.map(el => el.getAttribute("data-tile-id")));
  const tableHeight = (await page.locator("main.game > .table").boundingBox())!.height;
  const key = page.locator("main.game .tile-markings");
  await activate(key.locator(":scope > summary"));
  await expect(key).toHaveAttribute("open", "");
  const copy = [
    "✓ Check mark: selected. Tap the tile again to deselect.",
    "● Dot: played in the latest completed turn. A check mark replaces the dot while selected.",
    "Dashed destination: this selection can complete a valid turn here.",
    "Highlighted tile: part of the hint, not a move already played.",
  ];
  const comfortable = await page.locator(".app").evaluate(el => el.classList.contains("comfortable-reading"));
  for (let i = 0; i < copy.length; i++) {
    const paragraph = key.locator("p").nth(i);
    await expect(paragraph).toHaveText(t(copy[i]));
    await paragraph.scrollIntoViewIfNeeded();
    expect(await paragraph.evaluate(el => {
      const r = el.getBoundingClientRect(), container = el.closest(".more-actions > div")!.getBoundingClientRect();
      return r.top >= Math.max(0, container.top) && r.bottom <= Math.min(innerHeight, container.bottom) && r.left >= 0 && r.right <= innerWidth;
    })).toBe(true);
    expect(await paragraph.evaluate(el => parseFloat(getComputedStyle(el).fontSize))).toBeGreaterThanOrEqual(comfortable ? 18 : 16);
  }
  await page.screenshot({path: `/tmp/runset-tile-markings-${await page.locator("html").getAttribute("lang")}-${page.viewportSize()?.width}.png`});
  await activate(key.locator(":scope > summary"));
  expect(await page.evaluate(() => localStorage.getItem("runset.save.v1"))).toBe(before);
  expect(await page.locator("main.game .tile.selected").evaluateAll(els => els.map(el => el.getAttribute("data-tile-id")))).toEqual(selected);
  expect((await page.locator("main.game > .table").boundingBox())!.height).toBe(tableHeight);
}
