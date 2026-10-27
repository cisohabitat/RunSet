import { test, expect } from "@playwright/test";
import { practiceGame } from "../src/engine/practice";
import { reducer } from "../src/engine/game";
import { dailyPuzzle } from "../src/lib/dailyPuzzle";
import { exerciseGame, exerciseClue } from "../src/engine/exercises";
import { validSave } from "../src/lib/storage";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
for (const locale of ["en", "zh-CN"] as const)
  for (const [width, height, reading] of [
    [320, 640, true],
    [390, 844, false],
    [1180, 820, false],
  ] as const)
    test(`${locale} ${width} reading=${reading}: returning player moves through setup, hints, daily practice and results`, async ({
      page,
    }) => {
      const now = new Date(2026, 9, 27, 11),
        t = locale === "en" ? (s: string) => s : translator(messages),
        game = practiceGame();
      game.players[0].rack = [9, 35, 61];
      game.turnStart.rack = [9, 35, 61];
      const used = new Set(game.players.flatMap((p) => p.rack));
      game.pool = Array.from({ length: 106 }, (_, i) => i).filter(
        (id) => !used.has(id),
      );
      expect(validSave(game)).toBe(true);
      await page.clock.install({ time: now });
      await page.setViewportSize({ width, height });
      await page.emulateMedia({
        reducedMotion: "reduce",
        colorScheme: locale === "en" ? "light" : "dark",
      });
      await page.addInitScript(
        ({ game, locale, reading }) => {
          localStorage.setItem("runset.save.v1", JSON.stringify(game));
          localStorage.setItem("runset.language", locale);
          localStorage.setItem("runset.reading", String(reading));
          localStorage.setItem("runset.muted", "true");
        },
        { game, locale, reading },
      );
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto("/");
      await page
        .getByRole("button", { name: t("New game →"), exact: true })
        .click();
      await page.getByText(t("More game options"), { exact: true }).click();
      await page.getByText(t("Compare the opponents"), { exact: true }).click();
      const geometry = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        viewport: innerWidth,
        offenders: Array.from(document.querySelectorAll("main *"))
          .filter((el) => el.getBoundingClientRect().right > innerWidth)
          .map((el) => ({
            tag: el.tagName,
            cls: el.className,
            text: el.textContent?.slice(0, 70),
            width: el.getBoundingClientRect().width,
            right: el.getBoundingClientRect().right,
          }))
          .slice(0, 15),
      }));
      expect(geometry.width, JSON.stringify(geometry)).toBeLessThanOrEqual(
        geometry.viewport,
      );
      await page.locator(".difficulty-guide table").scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `/tmp/runset-release-setup-${locale}-${width}.png`,
      });
      await page
        .getByRole("button", { name: t("← Back"), exact: true })
        .click();
      await page
        .getByRole("button", { name: t("Continue game →"), exact: true })
        .click();
      await page
        .getByRole("button", { name: t("Show a possible move"), exact: true })
        .click();
      await page
        .getByRole("button", { name: t("Preview"), exact: true })
        .click();
      const modal = page.getByRole("dialog", {
        name: t("Preview this move"),
        exact: true,
      });
      await expect(modal).toBeVisible();
      const place = modal.getByRole("button", {
        name: t("Place hint"),
        exact: true,
      });
      expect(
        await place.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return (
            r.height >= 44 &&
            r.top >= 0 &&
            r.bottom <= innerHeight &&
            el.contains(
              document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
            )
          );
        }),
      ).toBe(true);
      await page.screenshot({
        path: `/tmp/runset-release-preview-${locale}-${width}.png`,
      });
      expect(
        await page.evaluate(() =>
          JSON.parse(localStorage.getItem("runset.save.v1")!),
        ),
      ).toEqual(game);
      await place.click();
      await expect(page.locator(".table .tile")).toHaveCount(3);
      await page
        .getByRole("button", { name: t("Undo move"), exact: true })
        .click();
      await expect
        .poll(() =>
          page.evaluate(
            () =>
              JSON.parse(localStorage.getItem("runset.save.v1")!).players[0]
                .rack,
          ),
        )
        .toEqual(game.players[0].rack);
      await page.getByRole("button", { name: t("Home"), exact: true }).click();
      await page
        .getByRole("button", { name: t("Quick exercises") + " →", exact: true })
        .click();
      await page
        .getByRole("button", { name: t("Play today's puzzle"), exact: true })
        .click();
      await page
        .getByRole("button", { name: t("Show clue"), exact: true })
        .click();
      await page
        .getByRole("button", { name: t("Show the tiles"), exact: true })
        .click();
      await page
        .getByRole("button", { name: t("Show the next step"), exact: true })
        .click();
      const daily = dailyPuzzle(now);
      let puzzle = exerciseGame(daily.kind, daily.code);
      const move = async (target: string) => {
        const ids = exerciseClue(daily.kind, puzzle);
        for (const id of ids)
          await page.locator(`.game [data-tile-id="${id}"]`).click();
        await page
          .locator(target === "new" ? ".new-meld" : ".meld-target")
          .first()
          .click();
        puzzle = reducer(puzzle, { type: "move", ids, target });
      };
      await move(daily.kind === "opening" ? "new" : puzzle.table[0].id);
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
      await page.getByRole("button", { name: t("Home"), exact: true }).click();
      await page
        .getByRole("button", { name: t("Continue game →"), exact: true })
        .click();
      await expect(page.locator(".rack .tile")).toHaveCount(3);
      await expect(page.locator(".table .tile")).toHaveCount(0);
      await page
        .getByRole("button", { name: t("Show a possible move"), exact: true })
        .click();
      await page
        .getByRole("button", { name: t("Place hint"), exact: true })
        .click();
      await page
        .getByRole("button", { name: t("End turn →"), exact: true })
        .click();
      await expect(
        page.getByRole("heading", {
          name: t("Beautifully played."),
          exact: true,
        }),
      ).toBeFocused();
      await expect(page.getByRole("meter")).toHaveCount(2);
      await expect(page.locator(".learning-takeaway")).toContainText(
        t(
          "You emptied your rack. Playing the last tile ends the round as soon as the turn is completed legally.",
        ),
      );
      const final = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("runset.save.v1")!),
      );
      expect(final.phase).toBe("over");
      expect(validSave(final)).toBe(true);
      await page
        .getByRole("button", { name: t("Change settings"), exact: true })
        .click();
      await expect(
        page.getByLabel(t("What should we call you?"), { exact: true }),
      ).toHaveValue(game.players[0].name);
      expect(
        await page.evaluate(() =>
          JSON.parse(localStorage.getItem("runset.save.v1")!),
        ),
      ).toEqual(final);
      expect(errors).toEqual([]);
    });
