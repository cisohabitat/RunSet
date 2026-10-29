import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
import { landscapePosition } from "./helpers/landscape";
import { exerciseGame } from "../src/engine/exercises";
import { practiceGame } from "../src/engine/practice";
import { reducer } from "../src/engine/game";
for (const locale of ["en", "zh-CN"] as const)
  for (const theme of ["light", "dark"] as const)
    test(`${locale} ${theme}: accessible landmarks, names and contrast across player screens`, async ({
      page,
    }) => {
      test.setTimeout(120000);
      const t = locale === "en" ? (s: string) => s : translator(messages);
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      await page.addInitScript((locale) => {
        localStorage.setItem("runset.language", locale);
        localStorage.setItem("runset.muted", "true");
      }, locale);
      const runtimeErrors: string[] = [];
      page.on("pageerror", (error) => runtimeErrors.push(error.message));
      const findings: {
        screen: string;
        id: string;
        impact?: string | null;
        nodes: { target: unknown; summary?: string }[];
      }[] = [];
      const audit = async (screen: string) => {
        const result = await new AxeBuilder({ page })
          .withTags([
            "wcag2a",
            "wcag2aa",
            "wcag21aa",
            "wcag22aa",
            "best-practice",
          ])
          .analyze();
        findings.push(
          ...result.violations.map((v) => ({
            screen,
            id: v.id,
            impact: v.impact,
            nodes: v.nodes
              .slice(0, 4)
              .map((n) => ({ target: n.target, summary: n.failureSummary })),
          })),
        );
      };
      await page.goto("/");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await audit("home");
      await page
        .getByRole("button", { name: t("New game →"), exact: true })
        .click();
      await expect(page.locator(".setup")).toBeVisible();
      await audit("setup");
      await page
        .getByRole("button", { name: t("← Back"), exact: true })
        .click();
      await page
        .getByRole("button", { name: t("Learn to play "), exact: false })
        .click();
      await expect(page.locator(".table")).toBeVisible();
      await audit("lesson");
      await page.getByRole("button", { name: t("Home"), exact: true }).click();
      await page
        .getByRole("button", { name: t("Quick exercises") + " →", exact: true })
        .click();
      await expect(page.locator(".exercise-choices")).toBeVisible();
      await audit("exercises");
      await page
        .getByRole("button", { name: t("Fill the gap") + " →", exact: true })
        .click();
      await expect(page.locator(".table")).toBeVisible();
      await audit("exercise board");
      await page.getByRole("button", { name: t("Home"), exact: true }).click();
      const game = landscapePosition();
      await page.evaluate(
        (game) => localStorage.setItem("runset.save.v1", JSON.stringify(game)),
        game,
      );
      await page.reload();
      await page
        .getByRole("button", { name: t("Continue game →"), exact: true })
        .click();
      await expect(page.locator(".table")).toBeVisible();
      await audit("game");
      await page
        .getByRole("button", { name: t("Settings"), exact: true })
        .click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await audit("settings");
      await page
        .locator(".settings-heading")
        .getByRole("button", { name: t("Done"), exact: true })
        .click();
      await page
        .getByRole("banner")
        .getByRole("button", { name: t("Home"), exact: true })
        .click();
      await page
        .getByRole("button", { name: t("How to play →"), exact: true })
        .click();
      await expect(page.locator(".guide")).toBeVisible();
      await audit("rules");
      await page
        .getByRole("banner")
        .getByRole("button", { name: t("Home"), exact: true })
        .click();
      let finished = exerciseGame("opening");
      finished.pool.push(
        ...finished.players[0].rack.filter((id) => ![9, 35, 61].includes(id)),
      );
      finished.players[0].rack = [9, 35, 61];
      finished.turnStart = { table: [], rack: [9, 35, 61] };
      finished = reducer(
        reducer(finished, { type: "move", ids: [9, 35, 61], target: "new" }),
        { type: "endTurn" },
      );
      let lesson = practiceGame("jokers");
      lesson = reducer(
        reducer(lesson, { type: "move", ids: [4], target: "practice-wild" }),
        { type: "move", ids: [104, 30, 56], target: "new" },
      );
      await page.evaluate(
        ({ finished, lesson }) => {
          localStorage.setItem("runset.save.v1", JSON.stringify(finished));
          localStorage.setItem(
            "runset.practice.v1",
            JSON.stringify({ lesson: "jokers", step: 0, game: lesson }),
          );
        },
        { finished, lesson },
      );
      await page.reload();
      await page
        .getByRole("button", { name: t("View results →"), exact: true })
        .click();
      await expect(page.locator(".game-over")).toBeVisible();
      await audit("results");
      await page
        .getByRole("banner")
        .getByRole("button", { name: t("Home"), exact: true })
        .click();
      await page
        .getByRole("button", { name: t("Learn to play "), exact: false })
        .click();
      await expect(page.locator(".practice-layout h1")).toBeVisible();
      await audit("completed lesson");
      expect(findings, JSON.stringify(findings, null, 2)).toEqual([]);
      expect(runtimeErrors).toEqual([]);
    });

for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: keyboard route focus, tile navigation and move undo preserve the game`, async ({
    page,
  }) => {
    const t = locale === "en" ? (s: string) => s : translator(messages);
    await page.addInitScript(
      (locale) => localStorage.setItem("runset.language", locale),
      locale,
    );
    await page.goto("/");
    const start = page.getByRole("button", {
      name: t("New game →"),
      exact: true,
    });
    await start.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".setup h1")).toBeFocused();
    await page.getByRole("button", { name: t("← Back"), exact: true }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".home h1")).toBeFocused();
    await page
      .getByRole("button", { name: t("Quick exercises") + " →", exact: true })
      .focus();
    await page.keyboard.press("Enter");
    await page
      .getByRole("button", { name: t("Extend a run") + " →", exact: true })
      .focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".exercise-goal h2").first()).toBeFocused();
    await page.locator('.rack [data-tile-id="3"]').focus();
    await page.keyboard.press("Space");
    await page.locator(".meld-target").focus();
    await page.keyboard.press("Enter");
    await page
      .getByRole("button", { name: t("Check move"), exact: true })
      .focus();
    await page.keyboard.press("Enter");
    await expect(
      page.getByRole("heading", { name: t("Well done! Goal complete.") }),
    ).toBeFocused();
    await page
      .getByRole("button", { name: t("Choose another exercise"), exact: true })
      .focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".exercises h1")).toBeFocused();
    await page
      .getByRole("banner")
      .getByRole("button", { name: t("Home"), exact: true })
      .focus();
    await page.keyboard.press("Enter");
    await page
      .getByRole("button", { name: t("Learn to play "), exact: false })
      .focus();
    await page.keyboard.press("Enter");
    await expect(page.locator(".practice-panel h1")).toBeFocused();
    await page
      .getByRole("banner")
      .getByRole("button", { name: t("Home"), exact: true })
      .focus();
    await page.keyboard.press("Enter");

    const game = landscapePosition();
    game.coach = false;
    delete game.turnSeconds;
    delete game.deadline;
    await page.evaluate(
      (game) => localStorage.setItem("runset.save.v1", JSON.stringify(game)),
      game,
    );
    await page.reload();
    await expect(
      page.getByRole("button", { name: t("Continue game →"), exact: true }),
    ).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: t("Skip to content") }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
    await page
      .getByRole("button", { name: t("Continue game →"), exact: true })
      .focus();
    await page.keyboard.press("Enter");
    await expect(page.locator('.rack [data-tile-id="3"]')).toBeFocused();
    const first = page.locator('.rack [data-tile-id="3"]');
    await first.focus();
    await page.keyboard.press("Space");
    await expect(first).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("ArrowRight");
    await expect(page.locator('.rack [data-tile-id="4"]')).toBeFocused();
    await page.keyboard.press("Space");
    await page.keyboard.press("n");
    await expect(page.locator('.table [data-tile-id="3"]')).toBeVisible();
    await page.keyboard.press("Control+z");
    await expect(page.locator('.rack [data-tile-id="3"]')).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            JSON.parse(localStorage.getItem("runset.save.v1")!).players[0].rack,
        ),
      )
      .toEqual(game.players[0].rack);
  });

for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: comfortable text reflows at 320 CSS pixels without losing actions`, async ({
    page,
  }) => {
    const t = locale === "en" ? (s: string) => s : translator(messages);
    await page.setViewportSize({ width: 320, height: 640 });
    await page.emulateMedia({
      colorScheme: locale === "en" ? "light" : "dark",
      reducedMotion: "reduce",
    });
    await page.addInitScript((locale) => {
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.reading", "true");
    }, locale);
    await page.goto("/");
    await page
      .getByRole("button", { name: t("Quick exercises") + " →", exact: true })
      .click();
    await page
      .getByRole("button", { name: t("Fill the gap") + " →", exact: true })
      .click();
    const instruction = page.locator(".exercise-goal > p").first();
    expect(
      await instruction.evaluate((el) =>
        parseFloat(getComputedStyle(el).fontSize),
      ),
    ).toBeGreaterThanOrEqual(18);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.locator('.game [data-tile-id="1"]').click();
    await page.locator(".meld-target").click();
    const check = page.getByRole("button", {
      name: t("Check move"),
      exact: true,
    });
    await check.scrollIntoViewIfNeeded();
    expect(
      await check.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return (
          r.height >= 44 &&
          r.left >= 0 &&
          r.right <= innerWidth &&
          r.top >= 0 &&
          r.bottom <= innerHeight &&
          el.contains(
            document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
          )
        );
      }),
    ).toBe(true);
    await check.click();
    await expect(
      page.getByRole("heading", { name: t("Well done! Goal complete.") }),
    ).toBeVisible();
    await page.screenshot({
      path: `/tmp/runset-a11y-reflow-${locale}.png`,
      fullPage: true,
    });
  });

for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: basics lesson completes with Tab, arrows, Space and Enter`, async ({
    page,
  }) => {
    const t = locale === "en" ? (s: string) => s : translator(messages);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.addInitScript((locale) => {
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.muted", "true");
    }, locale);
    await page.goto("/");
    await expect(page.locator(".home h1")).toBeVisible();
    const tabTo = async (target: ReturnType<typeof page.locator>) => {
      await expect(target).toBeVisible();
      for (let n = 0; n < 80; n++) {
        if (await target.evaluate((el) => el === document.activeElement))
          return;
        await page.keyboard.press("Tab");
      }
      throw Error(
        `Could not reach ${await target.getAttribute("class")} with Tab`,
      );
    };
    await tabTo(
      page.getByRole("button", { name: t("Learn to play "), exact: false }),
    );
    await page.keyboard.press("Enter");
    await expect(page.locator(".practice-panel h1")).toBeFocused();
    const group = async (first: number) => {
      await tabTo(page.locator(`.rack [data-tile-id="${first}"]`));
      await page.keyboard.press("Space");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("Space");
      await page.keyboard.press("ArrowRight");
      await page.keyboard.press("Space");
      await page.keyboard.press("n");
    };
    await group(9);
    await expect(page.locator(".practice-panel h1")).toHaveText(
      t("Make a run"),
    );
    await expect(page.locator(".practice-panel h1")).toBeFocused();
    await group(0);
    await expect(page.locator(".practice-panel h1")).toHaveText(
      t("Your first 30 points"),
    );
    const acknowledge = page.getByRole("button", {
      name: t("I see: 30 + 6 = 36 →"),
      exact: true,
    });
    await expect(acknowledge).toBeFocused();
    await expect(acknowledge).toBeInViewport();
    await expect(acknowledge).toHaveAccessibleDescription(
      t(
        "Your 10s score 30. Red 1 + 2 + 3 adds 6. Your opening is 36 points; at least 30 is required.",
      ),
    );
    for (const label of [
      "I see: 30 + 6 = 36 →",
      "End turn →",
      "Watch Juniper draw →",
      "Draw a tile",
    ]) {
      await tabTo(page.getByRole("button", { name: t(label), exact: false }));
      await page.keyboard.press("Enter");
      if (label === "End turn →") {
        const watch = page.getByRole("button", {
          name: t("Watch Juniper draw →"),
          exact: true,
        });
        await expect(watch).toBeFocused();
        await expect(watch).toBeInViewport();
      } else await expect(page.locator(".practice-panel h1")).toBeFocused();
    }
    await tabTo(page.locator('.rack [data-tile-id="12"]'));
    await page.keyboard.press("Space");
    await page.keyboard.press("n");
    await tabTo(
      page.getByRole("button", { name: t("Reset turn"), exact: true }),
    );
    await page.keyboard.press("Enter");
    await expect(page.locator(".practice-panel h1")).toHaveText(
      t("You know the basics"),
    );
    await expect(page.locator(".practice-panel h1")).toBeFocused();
    expect(
      await page.evaluate(() => localStorage.getItem("runset.save.v1")),
    ).toBeNull();
  });
