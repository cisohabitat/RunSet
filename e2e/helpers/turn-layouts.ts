import {
  expect,
  type Page,
  type BrowserContext,
  type TestInfo,
  type Locator,
} from "@playwright/test";
import { landscapePosition } from "./landscape";
import {
  replayTurnPractice,
  turnPracticeOutcome,
} from "../../src/lib/turnPractice";
import { turnLessonLayoutCopy } from "../../src/lib/turnLessons";
import { turnLayoutId } from "../../src/lib/turnLayouts";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";
export async function verifyTurnLayouts(
  { page, context }: { page: Page; context: BrowserContext },
  info: TestInfo,
  locale: "en" | "zh-CN",
) {
  const t = locale === "en" ? (s: string) => s : translator(messages),
    game = landscapePosition();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  delete game.deadline;
  delete game.turnSeconds;
  await page.emulateMedia({
    colorScheme: locale === "en" ? "light" : "dark",
    reducedMotion: "reduce",
  });
  await page.addInitScript(
    ({ game, locale }) => {
      if (sessionStorage.getItem("layout-seeded")) return;
      sessionStorage.setItem("layout-seeded", "1");
      localStorage.setItem("runset.save.v1", JSON.stringify(game));
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.reading", String(locale === "zh-CN"));
    },
    { game, locale },
  );
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
  const button = (text: string) =>
    page.getByRole("button", { name: t(text), exact: true });
  const stored = () =>
    page.evaluate(() => localStorage.getItem("runset.turnPractice.v1"));
  const enter = async () => {
    await activate(
      page.getByRole("button", { name: new RegExp(t("Learn to play")) }),
    );
    await activate(button("Practise a whole turn"));
    await expect(
      page.getByLabel(t("Whole-turn lesson"), { exact: true }),
    ).toBeVisible();
  };
  await page.goto("/");
  await expect(
    page.getByRole("status").filter({ hasText: t("Ready offline") }),
  ).toBeVisible();
  const regular = await page.evaluate(() =>
    localStorage.getItem("runset.save.v1"),
  );
  await context.setOffline(true);
  await enter();
  await page
    .getByLabel(t("Whole-turn lesson"), { exact: true })
    .selectOption("joker");
  await activate(button("Start selected lesson"));
  const orders = new Set<string>();
  for (const layout of [0, 1, 2, 3]) {
    await expect(
      page.getByText(t(`Practice layout ${layout + 1} of 4`), { exact: true }),
    ).toBeVisible();
    await expect(page.locator(".whole-turn-prompt")).toHaveText(
      t(turnLessonLayoutCopy("joker", layout).clue),
    );
    // Include colour as well as number: decorative SVG marks have no text.
    orders.add(JSON.stringify(await page.locator(".rack-tiles .tile").evaluateAll(
      (tiles) => tiles.map((tile) => tile.getAttribute("aria-label")),
    )));
    const move = async (ids: number[], existing = false) => {
      for (const id of ids)
        await activate(
          page.locator(`.game [data-tile-id="${turnLayoutId(id, layout)}"]`),
        );
      await activate(
        existing
          ? page.locator(".meld-target").first()
          : page.locator(".new-meld"),
      );
    };
    const first = page.locator(
      `.rack [data-tile-id="${turnLayoutId(4, layout)}"]`,
    );
    await activate(first);
    await activate(button("Hide practice steps"));
    await expect(first).toHaveAttribute("aria-pressed", "true");
    await activate(button("Show practice steps"));
    await expect(first).toHaveAttribute("aria-pressed", "true");
    await activate(page.locator(".meld-target").first());
    if (layout === 2) {
      const before = await stored();
      await page.reload();
      await enter();
      expect(await stored()).toBe(before);
      await expect(
        page.getByText(t("Practice layout 3 of 4"), { exact: true }),
      ).toBeVisible();
    }
    await move([104, 30, 56]);
    await activate(button("End turn →"));
    await expect(
      page.getByRole("heading", {
        name: t("Whole-turn practice complete"),
        exact: true,
      }),
    ).toBeVisible();
    const restored = replayTurnPractice(JSON.parse((await stored())!))!;
    expect(turnPracticeOutcome(restored.game, "joker")).toBe("complete");
    expect(restored.record.layout).toBe(layout);
    if (layout === 3)
      await page.screenshot({
        path: `/tmp/runset-turn-layouts-${info.project.name}-${locale}.png`,
        fullPage: true,
      });
    await activate(button("Start next practice layout"));
    await expect(page.locator(".table .meld .tile")).toHaveCount(3);
  }
  expect(errors).toEqual([]);
  expect(orders.size).toBe(4);
  await expect(
    page.getByText(t("Practice layout 1 of 4"), { exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("runset.save.v1")),
  ).toBe(regular);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
