import {
  expect,
  type Page,
  type BrowserContext,
  type TestInfo,
  type Locator,
} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { landscapePosition } from "./landscape";
import { openingExample, jokerExample } from "../../src/lib/ruleExamples";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";
export async function verifyRuleExamples(
  page: Page,
  context: BrowserContext,
  info: TestInfo,
  locale: "en" | "zh-CN",
  offline: boolean,
) {
  const t = locale === "en" ? (s: string) => s : translator(messages),
    game = landscapePosition(),
    raw = JSON.stringify(game),
    errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({
    reducedMotion: "reduce",
    colorScheme: locale === "en" ? "light" : "dark",
  });
  await page.addInitScript(
    ({ raw, locale }) => {
      if (sessionStorage.getItem("rule-examples-seed")) return;
      sessionStorage.setItem("rule-examples-seed", "1");
      localStorage.setItem("runset.save.v1", raw);
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.reading", String(locale === "zh-CN"));
      localStorage.setItem("runset.simpleHome", "false");
    },
    { raw, locale },
  );
  const b = (s: string) =>
      page.getByRole("button", { name: t(s), exact: true }),
    save = () => page.evaluate(() => localStorage.getItem("runset.save.v1"));
  const activate = async (el: Locator) => {
    await el.scrollIntoViewIfNeeded();
    expect(
      await el.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return (
          r.width >= 48 &&
          r.height >= 48 &&
          r.top >= 0 &&
          r.bottom <= innerHeight &&
          r.left >= 0 &&
          r.right <= innerWidth &&
          el.contains(
            document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
          )
        );
      }),
    ).toBe(true);
    if (info.project.name === "firefox-desktop") await el.click();
    else await el.tap();
  };
  await page.goto("/");
  if (offline) {
    await expect(
      page.getByRole("status").filter({ hasText: t("Ready offline") }),
    ).toBeVisible();
    await context.setOffline(true);
  }
  // The retained full-Home rules control is 44 px in standard reading.
  await b("How to play →").click();
  const opening = page.locator(".opening-example"),
    joker = page.locator(".joker-example");
  await expect(opening).toBeVisible();
  await activate(opening.locator("summary"));
  await expect(opening).toHaveAttribute("open", "");
  await expect(opening.locator(".opening-equation")).toHaveText(
    `${t("Opening total")}: 24 + 6 = 30 ${t("points")}`,
  );
  await expect(opening).toContainText(
    t(
      "The first group alone is only 24 points. Play both complete groups before ending your opening turn.",
    ),
  );
  await activate(joker.locator("summary"));
  await expect(joker).toHaveAttribute("open", "");
  await expect(joker).toContainText(
    t(
      "The joker now stands for 9. Both runs must be valid when you end your turn.",
    ),
  );
  const inspect = async () => {
    const figures = page.locator(".rule-example figure");
    await expect(figures).toHaveCount(5);
    const expected = [
      jokerExample.before,
      jokerExample.replacement,
      jokerExample.reuse,
      ...openingExample,
    ];
    for (let i = 0; i < expected.length; i++) {
      const f = figures.nth(i);
      await f.scrollIntoViewIfNeeded();
      expect(
        await f
          .locator(".tile")
          .evaluateAll((els) =>
            els.map((el) => Number(el.getAttribute("data-tile-id"))),
          ),
      ).toEqual([...expected[i]]);
      await expect(f.locator(".tile:enabled")).toHaveCount(0);
      expect(
        await f.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return (
            r.left >= 0 &&
            r.right <= innerWidth &&
            Array.from(el.querySelectorAll(".tile")).every((tile) => {
              const t = tile.getBoundingClientRect();
              return t.left >= r.left && t.right <= r.right;
            })
          );
        }),
      ).toBe(true);
      expect(
        await f
          .locator("figcaption")
          .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
      ).toBeGreaterThanOrEqual(locale === "zh-CN" ? 18 : 16);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  };
  await inspect();
  const size = page.viewportSize()!;
  await page.setViewportSize(
    size.width > 720
      ? { width: 820, height: 1180 }
      : { width: 844, height: 390 },
  );
  await inspect();
  await page.setViewportSize(size);
  expect(
    (await new AxeBuilder({ page }).include(".guide").analyze()).violations,
  ).toEqual([]);
  await joker.screenshot({
    path: `/tmp/runset-rule-joker-${info.project.name || "chromium"}-${locale}.png`,
  });
  await opening.scrollIntoViewIfNeeded();
  await page.screenshot({
    path: `/tmp/runset-rule-examples-${info.project.name || "chromium"}-${locale}.png`,
  });
  expect(await save()).toBe(raw);
  await b("← Back").click();
  await expect(page.locator(".home")).toBeVisible();
  expect(await save()).toBe(raw);
  await page.reload();
  expect(await save()).toBe(raw);
  expect(errors).toEqual([]);
}
