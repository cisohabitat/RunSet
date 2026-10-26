import { test, expect } from "@playwright/test";
import {
  exerciseGame,
  exerciseClue,
  exerciseKinds,
  exerciseCopy,
  exerciseDescription,
} from "../src/engine/exercises";
import { reducer } from "../src/engine/game";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
import { landscapePosition } from "./helpers/landscape";
for (const locale of ["en", "zh-CN"] as const)
  for (const width of [375, 1180])
    test(`${locale} ${width}: puzzle numbers replay, milestones deduplicate and regular saves survive`, async ({
      page,
    }) => {
      const t = locale === "en" ? (s: string) => s : translator(messages);
      const saved = landscapePosition();
      const code = 3871;
      await page.setViewportSize({ width, height: width === 375 ? 667 : 820 });
      await page.emulateMedia({
        colorScheme: locale === "en" ? "light" : "dark",
      });
      await page.addInitScript(
        ({ locale, saved }) => {
          localStorage.setItem("runset.language", locale);
          localStorage.setItem("runset.save.v1", JSON.stringify(saved));
          localStorage.setItem("runset.muted", "true");
        },
        { locale, saved },
      );
      await page.goto("/");
      await page
        .getByRole("button", { name: t("Quick exercises") + " →", exact: true })
        .click();
      await page.locator(".puzzle-picker summary").click();
      await page
        .getByLabel(t("Puzzle number"), { exact: true })
        .fill(String(code));
      await page
        .getByRole("button", { name: t("Start this puzzle"), exact: true })
        .click();
      await page.locator(".puzzle-picker summary").click();
      for (const [index, kind] of exerciseKinds.entries()) {
        if (index)
          await page
            .getByRole("button", {
              name: t(exerciseCopy[kind].title) + " →",
              exact: true,
            })
            .click();
        await expect(page.locator(".exercise-goal")).toContainText(
          t(exerciseDescription(kind, code).goal),
        );
        await page
          .getByRole("button", { name: t("Show clue"), exact: true })
          .click();
        let fixture = exerciseGame(kind, code);
        if (kind === "repair") {
          await page
            .getByRole("button", { name: t("Reset turn"), exact: true })
            .click();
          fixture = reducer(fixture, { type: "resetTurn" });
        }
        const move = async (ids: number[], target: string) => {
          for (const id of ids)
            await page.locator(`.game [data-tile-id="${id}"]`).click();
          await page
            .locator(target === "new" ? ".new-meld" : ".meld-target")
            .first()
            .click();
        };
        const target =
          kind === "opening" || kind === "repair" ? "new" : fixture.table[0].id;
        const ids = exerciseClue(kind, fixture);
        await move(ids, target);
        fixture = reducer(fixture, { type: "move", ids, target });
        if (kind === "joker") {
          await page
            .getByRole("button", { name: t("Check move"), exact: true })
            .click();
          await expect(
            page.getByRole("heading", { name: t("Well done! Goal complete.") }),
          ).toHaveCount(0);
          await move(exerciseClue(kind, fixture), "new");
        }
        await page
          .getByRole("button", { name: t("Check move"), exact: true })
          .click();
        await expect(
          page.getByRole("heading", { name: t("Well done! Goal complete.") }),
        ).toBeVisible();
        if (index < 3)
          await page
            .getByRole("button", {
              name: t("Choose another exercise"),
              exact: true,
            })
            .click();
      }
      await page.locator(".solo-progress summary").click();
      await expect(
        page.getByText(
          t("A lovely start: you have tried all four kinds of move!"),
        ),
      ).toBeVisible();
      const progress = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("runset.solo.v1")!),
      );
      expect(progress.completed).toHaveLength(4);
      await page
        .getByRole("button", { name: t("Restart exercise"), exact: true })
        .click();
      await expect(page.locator('.game [aria-pressed="true"]')).toHaveCount(0);
      const first = await page.evaluate(
        () => JSON.parse(localStorage.getItem("runset.exercises.v1")!).game,
      );
      await page
        .getByRole("button", { name: t("Restart exercise"), exact: true })
        .click();
      expect(
        await page.evaluate(
          () => JSON.parse(localStorage.getItem("runset.exercises.v1")!).game,
        ),
      ).toEqual(first);
      await page.reload();
      await page
        .getByRole("button", { name: t("Quick exercises") + " →", exact: true })
        .click();
      await expect(page.locator(".puzzle-picker summary")).toContainText(
        String(code),
      );
      await page.locator(".puzzle-picker summary").click();
      await page.getByLabel(t("Puzzle number"), { exact: true }).fill("0");
      await page
        .getByRole("button", { name: t("Start this puzzle"), exact: true })
        .click();
      await expect(page.locator(".puzzle-picker")).toContainText(
        t("Enter a puzzle number from 1 to 999999."),
      );
      expect(
        await page.evaluate(
          () => JSON.parse(localStorage.getItem("runset.exercises.v1")!).game,
        ),
      ).toEqual(first);
      expect(
        await page.evaluate(() =>
          JSON.parse(localStorage.getItem("runset.save.v1")!),
        ),
      ).toEqual(saved);
      await page.screenshot({
        path: `/tmp/runset-solo-${locale}-${width}.png`,
        fullPage: true,
      });
    });
test("damaged optional puzzle and progress records show recovery without touching a regular save", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("runset.exercises.v1", "{");
    localStorage.setItem("runset.solo.v1", '{"version":99}');
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Quick exercises →", exact: true })
    .click();
  await expect(
    page.getByText(
      "The saved exercise could not be restored. Choose an exercise to start again.",
    ),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Local progress could not be restored. New progress will start here.",
    ),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Extend a run →", exact: true })
    .click();
  await expect(page.locator(".table")).toBeVisible();
});

test("storage failure keeps puzzles playable and explains unsaved progress", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k: string, v: string) {
      if (k === "runset.solo.v1" || k === "runset.exercises.v1")
        throw new DOMException("Full", "QuotaExceededError");
      return set.call(this, k, v);
    };
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Quick exercises →", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Extend a run →", exact: true })
    .click();
  await page.locator('.game [data-tile-id="3"]').click();
  await page.locator(".meld-target").click();
  await page.getByRole("button", { name: "Check move", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Well done! Goal complete." }),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Exercise progress could not be saved. You can keep practising here.",
    ),
  ).toBeVisible();
  await expect(
    page.getByText("Local progress could not be saved. You can keep playing."),
  ).toBeVisible();
});
