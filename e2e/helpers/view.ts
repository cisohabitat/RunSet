import { expect, type Page } from "@playwright/test";

export async function chooseView(
  page: Page,
  value: "normal" | "wide" | "table",
  t: (text: string) => string = (text) => text,
) {
  const control = page.getByLabel(t("Table view"), { exact: true });
  await control.scrollIntoViewIfNeeded();
  const geometry = await control.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return {
      rect: r.toJSON(),
      viewport: [innerWidth, innerHeight],
      valid:
        r.width >= 44 &&
        r.height >= 44 &&
        r.top >= 0 &&
        r.bottom <= innerHeight &&
        r.left >= 0 &&
        r.right <= innerWidth &&
        el.contains(
          document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
        ),
    };
  });
  expect(geometry.valid, JSON.stringify(geometry)).toBe(true);
  await control.selectOption(value);
}
