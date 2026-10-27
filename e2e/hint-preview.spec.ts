import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { practiceGame } from "../src/engine/practice";
import { validSave } from "../src/lib/storage";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
const table = [{ id: "preview-opening", tiles: [9, 35, 61] }];
const hint = {
  table,
  used: [9, 35, 61],
  message:
    "Possible move: play 3 highlighted tiles for an opening worth 30 points. Review it, then choose Place hint if you want to use it. Your turn will not end automatically.",
  explanations: [
    "Group: 3 tiles showing 10, each with a different colour.",
    "Opening total: 30 points, meeting the 30-point requirement.",
  ],
};
async function mockPlanner(page: import("@playwright/test").Page) {
  await page.route(
    /\/(?:src\/workers\/planner\.ts|assets\/planner-[^/]+\.js)(?:\?.*)?$/,
    (route) =>
      route.fulfill({
        contentType: "application/javascript",
        body: `self.postMessage({ready:true});self.onmessage=()=>self.postMessage({result:${JSON.stringify(hint)}});`,
      }),
  );
}
for (const locale of ["en", "zh-CN"] as const)
  for (const width of [375, 1180])
    test(`${locale} ${width}: preview is read-only, accessible and explicitly applied`, async ({
      page,
    }) => {
      const t = locale === "en" ? (s: string) => s : translator(messages),
        game = practiceGame();
      await page.setViewportSize({ width, height: width === 375 ? 667 : 820 });
      await page.emulateMedia({
        reducedMotion: "reduce",
        colorScheme: locale === "en" ? "light" : "dark",
      });
      await page.addInitScript(
        ({ game, locale }) => {
          localStorage.setItem("runset.save.v1", JSON.stringify(game));
          localStorage.setItem("runset.language", locale);
        },
        { game, locale },
      );
      await mockPlanner(page);
      await page.goto("/");
      await page
        .getByRole("button", { name: t("Continue game →"), exact: true })
        .click();
      await page
        .getByRole("button", { name: t("Show a possible move"), exact: true })
        .click();
      const preview = page.getByRole("button", {
        name: t("Preview"),
        exact: true,
      });
      await preview.click();
      const modal = page.getByRole("dialog", { name: t("Preview this move") });
      await expect(modal).toBeVisible();
      await expect(
        modal.getByRole("button", { name: t("Back to table"), exact: true }),
      ).toBeFocused();
      await expect(modal.locator(".tile")).toHaveCount(3);
      await expect(modal.locator(".tile.glow")).toHaveCount(3);
      await expect(modal).toContainText(t(hint.explanations[1]));
      expect(
        await page.evaluate(() =>
          JSON.parse(localStorage.getItem("runset.save.v1")!),
        ),
      ).toEqual(game);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "best-practice"])
            .analyze()
        ).violations,
      ).toEqual([]);
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
        path: `/tmp/runset-preview-${locale}-${width}.png`,
      });
      await page.keyboard.press("Escape");
      await expect(modal).toHaveCount(0);
      await expect(preview).toBeFocused();
      expect(
        await page.evaluate(() =>
          JSON.parse(localStorage.getItem("runset.save.v1")!),
        ),
      ).toEqual(game);
      await preview.click();
      await modal
        .getByRole("button", { name: t("Place hint"), exact: true })
        .click();
      await expect(page.locator(".table .tile")).toHaveCount(3);
      await expect
        .poll(() =>
          page.evaluate(
            () =>
              JSON.parse(localStorage.getItem("runset.save.v1")!).history
                .length,
          ),
        )
        .toBe(1);
      const saved = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("runset.save.v1")!),
      );
      expect(validSave(saved)).toBe(true);
      expect(saved.turn).toBe(game.turn);
      expect(saved.current).toBe(0);
      await page
        .getByRole("button", { name: t("Undo move"), exact: true })
        .click();
      await expect(page.locator(".table .tile")).toHaveCount(0);
    });

test("timer expiry closes a preview without applying its tiles", async ({
  page,
}) => {
  const now = Date.now();
  await page.clock.install({ time: now });
  const game = practiceGame();
  game.turnSeconds = 60;
  game.deadline = now + 60000;
  await page.addInitScript(
    (game) => localStorage.setItem("runset.save.v1", JSON.stringify(game)),
    game,
  );
  await mockPlanner(page);
  await page.goto("/");
  await page
    .getByRole("button", { name: "Continue game →", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Show a possible move", exact: true })
    .click();
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.clock.fastForward(61000);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem("runset.save.v1")!).turn,
      ),
    )
    .toBeGreaterThan(game.turn);
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("runset.save.v1")!),
  );
  expect(saved.table).toEqual(game.table);
  expect(validSave(saved)).toBe(true);
});
