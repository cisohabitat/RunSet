import {
  expect,
  type BrowserContext,
  type Locator,
  type Page,
  type TestInfo,
} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { practiceGame } from "../../src/engine/practice";
import { reducer } from "../../src/engine/game";
import {
  replayTurnPractice,
  turnPracticeKey,
  turnPracticeOutcome,
} from "../../src/lib/turnPractice";
import { validSave } from "../../src/lib/storage";
import { landscapePosition } from "./landscape";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";
export async function verifyWholeTurn(
  { page, context }: { page: Page; context: BrowserContext },
  info: TestInfo,
  locale: "en" | "zh-CN",
) {
  const t = locale === "en" ? (s: string) => s : translator(messages),
    regular = landscapePosition(),
    lesson = {
      lesson: "basics",
      step: 1,
      game: reducer(practiceGame(), {
        type: "move",
        ids: [9, 35, 61],
        target: "new",
      }),
    };
  delete regular.deadline;
  delete regular.turnSeconds;
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({
    colorScheme: locale === "en" ? "light" : "dark",
    reducedMotion: "reduce",
  });
  await page.addInitScript(
    ({ regular, lesson, locale }) => {
      if (sessionStorage.getItem("whole-turn-seeded")) return;
      sessionStorage.setItem("whole-turn-seeded", "1");
      localStorage.setItem("runset.save.v1", JSON.stringify(regular));
      localStorage.setItem("runset.practice.v1", JSON.stringify(lesson));
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.reading", String(locale === "zh-CN"));
    },
    { regular, lesson, locale },
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
  const button = (label: string) =>
    page.getByRole("button", { name: t(label), exact: true });
  const regularBytes = () =>
    page.evaluate(() => localStorage.getItem("runset.save.v1"));
  const lessonBytes = () =>
    page.evaluate(() => localStorage.getItem("runset.practice.v1"));
  const record = () =>
    page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key) ?? "null"),
      turnPracticeKey,
    );
  const learn = async () => {
    await activate(
      page.getByRole("button", { name: new RegExp(t("Learn to play")) }),
    );
    await expect(
      page.getByRole("heading", { name: t("Make a run"), exact: true }),
    ).toBeVisible();
    await activate(button("Practise a whole turn"));
    await expect(
      page.getByRole("region", { name: t("Whole-turn practice"), exact: true }),
    ).toBeVisible();
  };
  const place = async (ids: number[]) => {
    for (const id of ids)
      await activate(page.locator(`.rack [data-tile-id="${id}"]`));
    await activate(page.locator(".new-meld"));
  };
  await page.goto("/");
  await expect(
    page.getByRole("status").filter({ hasText: t("Ready offline") }),
  ).toBeVisible();
  const saved = await regularBytes(),
    short = await lessonBytes();
  await context.setOffline(true);
  await learn();
  if (locale === "zh-CN")
    await expect(page.locator(".rack-heading")).toContainText("你");
  expect(
    (await page.locator(".table").boundingBox())!.height,
  ).toBeGreaterThanOrEqual(260);
  // Prompt changes preserve the selected physical tile and draft.
  await activate(page.locator('.rack [data-tile-id="0"]'));
  await activate(button("Hide practice steps"));
  await expect(page.locator('.rack [data-tile-id="0"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.locator(".whole-turn-prompt")).toHaveCount(0);
  await activate(button("Show practice steps"));
  await activate(page.locator(".new-meld"));
  await expect(page.locator('.table [data-tile-id="0"]')).toBeVisible();
  const partial = await record();
  await activate(button("Check this turn"));
  await expect(
    page.getByRole("status").filter({
      hasText: t(
        "Your turn is not ready. Keep editing or choose Reset. No penalty was applied.",
      ),
    }),
  ).toBeVisible();
  expect(await record()).toEqual(partial);
  await activate(
    page.getByRole("button", { name: t("Reset turn"), exact: true }),
  );
  await place([9, 35, 61]);
  await expect(page.locator(".whole-turn-prompt")).toHaveText(
    t("Your opening is ready. Choose End turn to complete this practice."),
  );
  const ready = await record();
  const restored = replayTurnPractice(ready)!;
  expect(validSave(restored.game)).toBe(true);
  expect(restored.game.current).toBe(0);
  await page.reload();
  await learn();
  await expect(page.locator(".table .meld .tile")).toHaveCount(3);
  expect(await record()).toEqual(ready);
  await expect(page.locator(".practice-restored")).toContainText(
    t("Your saved practice is ready to finish. Choose End turn."),
  );
  await activate(button("End turn →"));
  const complete = page.getByRole("heading", {
    name: t("Opening turn complete"),
    exact: true,
  });
  await expect(complete).toBeVisible();
  await expect(complete).toBeFocused();
  await expect(
    page
      .getByRole("region", { name: t("Completed lesson table") })
      .locator(".tile"),
  ).toHaveCount(3);
  expect(turnPracticeOutcome(replayTurnPractice(await record())!.game)).toBe(
    "complete",
  );
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: `/tmp/runset-whole-turn-${info.project.name}-${locale}.png`,
    fullPage: true,
  });
  await activate(button("Try with fewer prompts"));
  await expect(page.locator(".practice-restored")).toHaveCount(0);
  await expect(page.locator(".whole-turn-prompt")).toHaveCount(0);
  await expect(page.locator("[data-coach-target=true]")).toHaveCount(0);
  expect((await record()).mode).toBe("quiet");
  // Quiet practice remains voluntary: show help, then hide it without a new deal.
  await activate(page.locator('.rack [data-tile-id="9"]'));
  await activate(button("Show practice steps"));
  await expect(page.locator('.rack [data-tile-id="9"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await activate(button("Hide practice steps"));
  for (const id of [35, 61])
    await activate(page.locator(`.rack [data-tile-id="${id}"]`));
  await activate(page.locator(".new-meld"));
  await activate(button("End turn →"));
  await expect(
    page.getByRole("heading", {
      name: t("Whole-turn practice complete"),
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: t("Play against one Easy opponent →"),
      exact: true,
    }),
  ).toBeVisible();
  await activate(button("Restart whole-turn practice"));
  await activate(
    page.getByRole("button", {
      name: new RegExp(t("Draw a tile")),
      exact: false,
    }),
  );
  await expect(
    page.getByRole("heading", {
      name: t("Drawing ends your turn"),
      exact: true,
    }),
  ).toBeVisible();
  expect(turnPracticeOutcome(replayTurnPractice(await record())!.game)).toBe(
    "drawn",
  );
  await activate(button("Back to short lessons"));
  await expect(
    page.getByRole("heading", { name: t("Make a run"), exact: true }),
  ).toBeVisible();
  expect(await regularBytes()).toBe(saved);
  expect(await lessonBytes()).toBe(short);
  expect(errors).toEqual([]);
}
