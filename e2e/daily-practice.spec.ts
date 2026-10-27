import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { dailyPuzzle } from "../src/lib/dailyPuzzle";
import {
  exerciseGame,
  exerciseClue,
  exerciseClueText,
} from "../src/engine/exercises";
import { reducer } from "../src/engine/game";
import { landscapePosition } from "./helpers/landscape";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
for (const locale of ["en", "zh-CN"] as const)
  for (const width of [375, 1180])
    test(`${locale} ${width}: daily practice reveals clues, survives midnight and keeps regular progress`, async ({
      page,
    }) => {
      const now = new Date(2026, 9, 27, 11),
        daily = dailyPuzzle(now),
        t = locale === "en" ? (s: string) => s : translator(messages),
        saved = landscapePosition();
      delete saved.turnSeconds;
      delete saved.deadline;
      await page.clock.install({ time: now });
      await page.setViewportSize({ width, height: width === 375 ? 667 : 820 });
      await page.emulateMedia({
        reducedMotion: "reduce",
        colorScheme: locale === "en" ? "light" : "dark",
      });
      await page.addInitScript(
        ({ locale, saved }) => {
          localStorage.setItem("runset.language", locale);
          if (!localStorage.getItem("runset.save.v1"))
            localStorage.setItem("runset.save.v1", JSON.stringify(saved));
        },
        { locale, saved },
      );
      const open = async () => {
        await page.goto("/");
        await page
          .getByRole("button", {
            name: t("Quick exercises") + " →",
            exact: true,
          })
          .click();
      };
      await open();
      await page
        .getByRole("button", { name: t("Play today's puzzle"), exact: true })
        .click();
      await expect(page.locator(".daily-session")).toHaveText(
        t(`Daily puzzle: ${daily.date}`),
      );
      const initial = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("runset.exercises.v1")!),
      );
      await page
        .getByRole("button", { name: t("Show clue"), exact: true })
        .click();
      await expect(page.locator(".exercise-clue .tile")).toHaveCount(0);
      await expect(page.locator(".game .tile.glow")).toHaveCount(0);
      await page
        .getByRole("button", { name: t("Show the tiles"), exact: true })
        .click();
      let game = exerciseGame(daily.kind, daily.code);
      await expect(page.locator(".exercise-clue .tile")).toHaveCount(
        exerciseClue(daily.kind, game).length,
      );
      await page
        .getByRole("button", { name: t("Show the next step"), exact: true })
        .click();
      await expect(page.locator(".clue-step")).toHaveText(
        t(exerciseClueText(daily.kind, game)),
      );
      expect(
        await page.evaluate(() =>
          JSON.parse(localStorage.getItem("runset.exercises.v1")!),
        ),
      ).toEqual(initial);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "best-practice"])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.locator(".exercise-clue").scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `/tmp/runset-daily-${locale}-${width}.png`,
      });
      const move = async (target: string) => {
        const ids = exerciseClue(daily.kind, game);
        for (const id of ids)
          await page.locator(`.game [data-tile-id="${id}"]`).click();
        await page
          .locator(target === "new" ? ".new-meld" : ".meld-target")
          .first()
          .click();
        game = reducer(game, { type: "move", ids, target });
      };
      await move(daily.kind === "opening" ? "new" : game.table[0].id);
      if (daily.kind === "joker") await move("new");
      await page
        .getByRole("button", { name: t("Check move"), exact: true })
        .click();
      await expect(
        page.getByRole("heading", {
          name: t("Well done! Goal complete."),
          exact: true,
        }),
      ).toBeVisible();
      await expect(
        page.getByText(t("Already practised. Replay whenever you like."), {
          exact: true,
        }),
      ).toBeVisible();
      await page.clock.setSystemTime(new Date(2026, 9, 28, 0, 1));
      await page.clock.fastForward(61000);
      await expect(page.locator(".daily-practice")).toContainText("2026-10-28");
      await expect(page.locator(".daily-session")).toHaveText(
        t(`Daily puzzle: ${daily.date}`),
      );
      await page.reload();
      await page
        .getByRole("button", { name: t("Quick exercises") + " →", exact: true })
        .click();
      await expect(page.locator(".daily-session")).toHaveText(
        t(`Daily puzzle: ${daily.date}`),
      );
      await page
        .getByRole("button", { name: t("Play today's puzzle"), exact: true })
        .click();
      const next = dailyPuzzle(new Date(2026, 9, 28));
      await expect(page.locator(".daily-session")).toHaveText(
        t(`Daily puzzle: ${next.date}`),
      );
      expect(
        await page.evaluate(() =>
          JSON.parse(localStorage.getItem("runset.save.v1")!),
        ),
      ).toEqual(saved);
      const progress = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("runset.solo.v1")!),
      );
      expect(progress.completed).toContain(`${daily.kind}:${daily.code}`);
    });
