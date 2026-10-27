import {
  expect,
  type Page,
  type BrowserContext,
  type TestInfo,
  type Locator,
} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { landscapePosition } from "./landscape";
import {
  replayTurnPractice,
  turnPracticeOutcome,
} from "../../src/lib/turnPractice";
import { validSave } from "../../src/lib/storage";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";
export async function verifyTurnLessons(
  { page, context }: { page: Page; context: BrowserContext },
  info: TestInfo,
  locale: "en" | "zh-CN",
) {
  const t = locale === "en" ? (s: string) => s : translator(messages),
    regular = landscapePosition();
  delete regular.turnSeconds;
  delete regular.deadline;
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({
    colorScheme: locale === "en" ? "light" : "dark",
    reducedMotion: "reduce",
  });
  await page.addInitScript(
    ({ regular, locale }) => {
      if (sessionStorage.getItem("turn-lessons-seeded")) return;
      sessionStorage.setItem("turn-lessons-seeded", "1");
      localStorage.setItem("runset.save.v1", JSON.stringify(regular));
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.reading", String(locale === "zh-CN"));
    },
    { regular, locale },
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
  const move = async (ids: number[], target = "new") => {
    for (const id of ids)
      await activate(page.locator(`.game [data-tile-id="${id}"]`));
    await activate(
      target === "new"
        ? page.locator(".new-meld")
        : page.locator(".meld-target").first(),
    );
  };
  await page.goto("/");
  await expect(
    page.getByRole("status").filter({ hasText: t("Ready offline") }),
  ).toBeVisible();
  const regularBytes = await page.evaluate(() =>
    localStorage.getItem("runset.save.v1"),
  );
  await context.setOffline(true);
  await enter();
  await move([9]);
  const draft = await stored();
  await page
    .getByLabel(t("Whole-turn lesson"), { exact: true })
    .selectOption("extend");
  expect(await stored()).toBe(draft);
  await expect(page.locator('.table [data-tile-id="9"]')).toBeVisible();
  for (const lesson of ["extend", "rearrange", "joker", "draw"] as const) {
    await page
      .getByLabel(t("Whole-turn lesson"), { exact: true })
      .selectOption(lesson);
    await activate(button("Start selected lesson"));
    expect(JSON.parse((await stored())!).lesson).toBe(lesson);
    expect(
      (await page.locator(".table").boundingBox())!.height,
    ).toBeGreaterThanOrEqual(260);
    if (lesson === "extend") await move([5], "old");
    if (lesson === "rearrange") await move([3, 4, 5, 6]);
    if (lesson === "joker") {
      await move([4], "old");
      const halfway = await stored();
      await page.reload();
      await enter();
      expect(await stored()).toBe(halfway);
      await expect(page.locator('.table [data-tile-id="4"]')).toBeVisible();
      await move([104, 30, 56]);
    }
    if (lesson === "draw")
      await activate(
        page.getByRole("button", { name: new RegExp(t("Draw a tile")) }),
      );
    else {
      const prepared = replayTurnPractice(JSON.parse((await stored())!))!;
      expect(validSave(prepared.game)).toBe(true);
      expect(prepared.game.current).toBe(0);
      await activate(button("End turn →"));
    }
    await expect(
      page.getByRole("heading", {
        name: t("Whole-turn practice complete"),
        exact: true,
      }),
    ).toBeVisible();
    const restored = replayTurnPractice(JSON.parse((await stored())!))!;
    expect(validSave(restored.game)).toBe(true);
    expect(turnPracticeOutcome(restored.game, lesson)).toBe("complete");
    if (lesson === "joker") {
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      await page.screenshot({
        path: `/tmp/runset-turn-lessons-${info.project.name}-${locale}.png`,
        fullPage: true,
      });
    }
    if (lesson === "extend") {
      await activate(button("Try with fewer prompts"));
      await expect(page.locator(".whole-turn-prompt")).toHaveCount(0);
      await activate(
        page.getByRole("button", { name: new RegExp(t("Draw a tile")) }),
      );
      await expect(
        page.getByRole("heading", {
          name: t("Drawing ends your turn"),
          exact: true,
        }),
      ).toBeVisible();
    }
  }
  expect(
    await page.evaluate(() => localStorage.getItem("runset.save.v1")),
  ).toBe(regularBytes);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
}
