import {
  expect,
  type Page,
  type BrowserContext,
  type TestInfo,
  type Locator,
} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { landscapePosition } from "./landscape";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";
export async function verifyOpponentGuide(
  { page, context }: { page: Page; context: BrowserContext },
  info: TestInfo,
  locale: "en" | "zh-CN",
  offline = true,
) {
  const t = locale === "en" ? (s: string) => s : translator(messages),
    game = landscapePosition(false, 3),
    now = Date.now();
  delete game.match;
  game.coach = false;
  game.deadline = now + 120000;
  const names = ["Opening", "Normal", "红色 7"];
  game.players.slice(1).forEach((p, i) => {
    p.name = names[i];
    p.bot = (["easy", "normal", "hard"] as const)[i];
  });
  await page.clock.install({ time: now });
  await page.emulateMedia({
    colorScheme: locale === "en" ? "light" : "dark",
    reducedMotion: "reduce",
  });
  await page.addInitScript(
    ({ game, locale }) => {
      localStorage.setItem("runset.save.v1", JSON.stringify(game));
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.reading", String(locale === "zh-CN"));
    },
    { game, locale },
  );
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const activate = async (el: Locator) => {
    await el.scrollIntoViewIfNeeded();
    expect(
      await el.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return el.contains(
          document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
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
  await activate(
    page.getByRole("button", { name: t("Continue game →"), exact: true }),
  );
  await expect(page.locator(".rack")).toBeVisible();
  const selected = page.locator('.rack [data-tile-id="3"]');
  await activate(selected);
  const saved = await page.evaluate(() =>
    localStorage.getItem("runset.save.v1"),
  );
  await activate(page.locator(".more-actions > summary"));
  const guide = page.locator(".opponent-guide"),
    summary = guide.locator(":scope > summary");
  await activate(summary);
  for (let i = 0; i < names.length; i++) {
    const row = guide.locator("li").nth(i);
    await expect(row.locator("strong")).toHaveText(names[i]);
    await expect(row).toContainText(
      t((["easy", "normal", "hard"] as const)[i]),
    );
  }
  await expect(guide).toContainText(t("Easy may draw repeatedly while waiting for a new group or run. After opening, Normal can also add single tiles to the table."));
  await expect(guide).toContainText(
    t(
      "An opponent drawing does not prove that no legal move exists. Its search may not find every move.",
    ),
  );
  await expect(guide).toContainText(
    t(
      "Opponent pace changes waiting time, not tile choices. Change the playing style when starting a fresh game.",
    ),
  );
  const explanation = guide.locator("p");
  for (const paragraph of await explanation.all()) {
    await paragraph.scrollIntoViewIfNeeded();
    expect(
      await paragraph.evaluate((el) => {
        const r = el.getBoundingClientRect(),
          menu = el.closest(".more-actions > div")!.getBoundingClientRect();
        return (
          r.top >= menu.top &&
          r.bottom <= menu.bottom &&
          r.left >= menu.left &&
          r.right <= menu.right
        );
      }),
    ).toBe(true);
  }
  expect(
    (await new AxeBuilder({ page }).include(".opponent-guide").analyze())
      .violations,
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  // Every paragraph is reachable within the menu, including the last fairness note.
  expect((await summary.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await page.screenshot({
    path: `/tmp/runset-opponent-guide-${info.project.name}-${locale}.png`,
  });
  await activate(summary);
  await activate(page.locator(".more-actions > summary"));
  await expect(selected).toHaveAttribute("aria-pressed", "true");
  expect(
    await page.evaluate(() => localStorage.getItem("runset.save.v1")),
  ).toBe(saved);
  expect(errors).toEqual([]);
}
