import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { jokerFinish } from "./helpers/finish";
import {
  exerciseGame,
  exerciseDescription,
  exerciseClue,
} from "../src/engine/exercises";
import { practiceSuggestion } from "../src/lib/practiceSuggestion";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
for (const locale of ["en", "zh-CN"] as const)
  for (const scenario of ["opening", "joker", "extend"] as const)
    test(`${locale} ${scenario}: explained practice keeps the saved round`, async ({
      page,
    }, info) => {
      const t = locale === "en" ? (s: string) => s : translator(messages),
        game = scenario === "extend" ? null : jokerFinish();
      if (game && scenario === "opening")
        game.players.find((p) => !p.bot)!.melded = false;
      const completed = scenario === "extend" ? (["opening"] as const) : [];
      const idea = practiceSuggestion(game, completed)!;
      if (!info.project.name)
        await page.setViewportSize({ width: 375, height: 667 });
      await page.emulateMedia({
        reducedMotion: "reduce",
        colorScheme: locale === "en" ? "light" : "dark",
      });
      await page.addInitScript(
        ({ game, locale, completed }) => {
          if (game)
            localStorage.setItem("runset.save.v1", JSON.stringify(game));
          localStorage.setItem("runset.language", locale);
          localStorage.setItem(
            "runset.solo.v1",
            JSON.stringify({
              version: 1,
              completed: completed.length ? ["opening:4321"] : [],
              kinds: completed,
            }),
          );
        },
        { game, locale, completed },
      );
      await page.goto("/");
      if (game) {
        await page
          .getByRole("button", { name: t("View results →"), exact: true })
          .click();
        await page
          .getByRole("button", { name: t("Try quick practice"), exact: true })
          .click();
      } else
        await page
          .getByRole("button", {
            name: t("Quick exercises") + " →",
            exact: true,
          })
          .click();
      const card = page.getByRole("region", {
        name: t("A practice idea"),
        exact: true,
      });
      await expect(card).toContainText(t(idea.reason));
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "best-practice"])
            .analyze()
        ).violations,
      ).toEqual([]);
      await card.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `/tmp/runset-suggestion-${info.project.name || "chromium"}-${locale}-${scenario}.png`,
      });
      await page
        .getByRole("button", { name: t("Try suggested exercise"), exact: true })
        .click();
      await expect(page.locator(".exercise-goal")).toContainText(
        t(exerciseDescription(scenario).goal),
      );
      if (scenario === "extend") {
        const puzzle = exerciseGame("extend");
        for (const id of exerciseClue("extend", puzzle))
          await page.locator(`.game [data-tile-id="${id}"]`).click();
        await page.locator(".meld-target").first().click();
        await page
          .getByRole("button", { name: t("Check move"), exact: true })
          .click();
        await page
          .getByRole("button", {
            name: t("Choose another exercise"),
            exact: true,
          })
          .click();
        await expect(page.locator(".practice-suggestion h3")).toHaveText(
          t("Fill the gap"),
        );
      }
      expect(
        await page.evaluate(() =>
          JSON.parse(localStorage.getItem("runset.save.v1") ?? "null"),
        ),
      ).toEqual(game);
    });
test("opening practice from results resumes an existing exercise draft", async ({
  page,
}) => {
  const game = jokerFinish(),
    draft = {
      version: 1,
      kind: "repair",
      game: exerciseGame("repair", 827),
      checked: false,
    };
  await page.addInitScript(
    ({ game, draft }) => {
      localStorage.setItem("runset.save.v1", JSON.stringify(game));
      localStorage.setItem("runset.exercises.v1", JSON.stringify(draft));
    },
    { game, draft },
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "View results →", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Try quick practice", exact: true })
    .click();
  await expect(page.locator(".exercise-goal")).toContainText(
    exerciseDescription("repair", 827).goal,
  );
  await expect(page.locator(".practice-suggestion")).toHaveCount(0);
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("runset.exercises.v1")!),
    ),
  ).toEqual(draft);
});
