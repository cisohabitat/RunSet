import {expect, type Locator, type Page} from "@playwright/test";

/** The exit stays available while native scrolling exposes lower settings. */
export async function verifySettingsChrome(page: Page, dialog: Locator) {
  const header = dialog.locator(".settings-heading");
  const done = header.getByRole("button");
  const control = dialog.locator("select").last();
  await control.scrollIntoViewIfNeeded();
  const measure = () => done.evaluate(el => {
    const r = el.getBoundingClientRect();
    const d = el.closest("dialog")!.getBoundingClientRect();
    const h = el.closest(".settings-heading")!.getBoundingClientRect();
    return {
      inside: r.top >= Math.max(0, d.top) && r.bottom <= Math.min(innerHeight, d.bottom)
        && r.left >= d.left && r.right <= Math.min(innerWidth, d.right),
      hit: el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)),
      target: r.width >= 44 && r.height >= 44,
      heading: h.top >= d.top && h.bottom <= d.bottom,
    };
  });
  await expect.poll(measure).toEqual({inside:true, hit:true, target:true, heading:true});
  expect(await control.evaluate(el => {
    const r = el.getBoundingClientRect();
    const h = el.closest("dialog")!.querySelector(".settings-heading")!.getBoundingClientRect();
    return r.top >= h.bottom && r.bottom <= innerHeight
      && el.contains(document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2));
  })).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}
