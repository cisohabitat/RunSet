import { test, expect } from "@playwright/test";

for (const theme of ["light", "dark"] as const) {
  test(`${theme}: visible lesson navigation, hint actions, and readable tile colours`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    for (const [width, height] of [[375, 667], [820, 1180], [1440, 900]]) {
      await page.setViewportSize({ width, height });
      await page.goto("/");
      await page.evaluate(async () => {
        const { practiceGame } = await import("/src/engine/practice.ts");
        localStorage.removeItem("runset.practice.v1");
        localStorage.setItem("runset.save.v1", JSON.stringify(practiceGame()));
      });
      await page.reload();
      await page.getByRole("button", { name: /Learn to play/ }).click();
      for (const label of ["Restart lesson", "Basics", "Jokers", "Rearranging"]) {
        const visible = await page.getByRole("button", { name: label, exact: true }).evaluate(el => {
          const r = el.getBoundingClientRect(), panel = el.closest(".practice-panel")!.getBoundingClientRect();
          return r.top >= panel.top && r.bottom <= panel.bottom && document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === el;
        });
        expect(visible, `${label}, ${width}px`).toBe(true);
      }
      expect(await page.locator("#practice-instructions").evaluate(el => {
        const r = el.getBoundingClientRect(), copy = el.closest(".practice-copy")!.getBoundingClientRect();
        return r.top >= copy.top && r.bottom <= copy.bottom + 1;
      })).toBe(true);
      for (const lesson of ["Rearranging", "Jokers"]) {
        await page.getByRole("button", { name: lesson, exact: true }).click();
        expect(await page.locator("#practice-instructions").evaluate(el => {
          const r = el.getBoundingClientRect(), copy = el.closest(".practice-copy")!.getBoundingClientRect();
          return r.top >= copy.top && r.bottom <= copy.bottom + 1;
        }), `${lesson} instructions, ${width}px`).toBe(true);
      }
      const contrasts = await page.locator(".rack .tile,.table .tile,.primary:disabled").evaluateAll(elements => {
        const luminance = (rgb: string) => {
          const channels = rgb.match(/[\d.]+/g)!.slice(0, 3).map(Number).map(v => v / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
          return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
        };
        return elements.map(el => {
          const css = getComputedStyle(el), a = luminance(css.color), b = luminance(css.backgroundColor);
          return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
        });
      });
      expect(Math.min(...contrasts)).toBeGreaterThanOrEqual(4.5);
      expect(await page.locator(".primary:disabled").first().evaluate(el => getComputedStyle(el).opacity)).toBe("1");
      await page.getByRole("button", { name: "Exit practice", exact: true }).click();
      await page.getByRole("button", { name: /Continue game/ }).click();
      await page.getByRole("button", { name: "Show a possible move" }).click();
      const place = page.getByRole("button", { name: "Place hint", exact: true });
      await expect(place).toBeVisible();
      expect(await place.evaluate(el => {
        const r = el.getBoundingClientRect(), context = el.closest(".game-context")!.getBoundingClientRect();
        return r.top >= context.top && r.bottom <= context.bottom && document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === el;
      })).toBe(true);
      if (width >= 721) expect(await page.locator(".table-tools").evaluate(el => {
        const r = el.getBoundingClientRect(), context = el.closest(".game-context")!.getBoundingClientRect();
        return r.top >= context.top && r.bottom <= context.bottom;
      })).toBe(true);
      await expect(page.locator(".hint-reasons")).not.toHaveAttribute("open");
      await page.getByText("Why this works", { exact: true }).click();
      await expect(page.locator(".hint-reasons li").first()).toBeVisible();
      await page.getByRole("button", { name: "Home", exact: true }).click();
    }
  });
}
