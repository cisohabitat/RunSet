import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { practiceGame } from "../src/engine/practice";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
for (const locale of ["en", "zh-CN"] as const)
  for (const kind of ["setup", "exercises", "game"] as const)
    test(`${locale} ${kind}: slow screen retains a landmark, skip target and final focus`, async ({
      page,
    }) => {
      const t = locale === "en" ? (s: string) => s : translator(messages),
        game = practiceGame();
      await page.addInitScript(
        ({ game, locale }) => {
          localStorage.setItem("runset.save.v1", JSON.stringify(game));
          localStorage.setItem("runset.language", locale);
        },
        { game, locale },
      );
      let release!: () => void;
      const gate = new Promise<void>((done) => (release = done));
      const module = { setup: "Setup", exercises: "Exercises", game: "Game" }[
        kind
      ];
      await page.route(
        new RegExp(
          `/(?:src/ui/${module}\\.tsx|assets/${module}-[^/]+\\.js)(?:\\?.*)?$`,
        ),
        async (route) => {
          await gate;
          await route.continue();
        },
      );
      try {
        await page.goto("/");
        await page
          .getByRole("button", {
            name:
              kind === "exercises"
                ? `${t("Quick exercises")} →`
                : t(kind === "setup" ? "New game →" : "Continue game →"),
            exact: true,
          })
          .click();
        const main = page.getByRole("main");
        await expect(main).toHaveAttribute("aria-busy", "true");
        await expect(main.getByRole("status")).toBeVisible();
        expect(
          (
            await new AxeBuilder({ page })
              .withTags(["wcag2a", "wcag2aa", "best-practice"])
              .analyze()
          ).violations,
        ).toEqual([]);
        const skip = page.getByRole("link", {
          name: t("Skip to content"),
          exact: true,
        });
        await skip.focus();
        await skip.press("Enter");
        await expect(main).toBeFocused();
        release();
        await expect(page.locator('main[aria-busy="true"]')).toHaveCount(0);
        if (kind === "game")
          await expect(
            page.locator('.rack button[tabindex="0"]'),
          ).toBeFocused();
        else
          await expect(
            page.getByRole("heading", {
              name: t(kind === "setup" ? "Ready to play?" : "Quick exercises"),
              exact: true,
            }),
          ).toBeFocused();
        expect(
          await page.evaluate(() =>
            JSON.parse(localStorage.getItem("runset.save.v1")!),
          ),
        ).toEqual(game);
      } finally {
        release();
      }
    });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: returning Home during loading cancels navigation without changing a save`, async ({
    page,
  }) => {
    const t = locale === "en" ? (s: string) => s : translator(messages),
      game = practiceGame();
    await page.addInitScript(
      ({ game, locale }) => {
        localStorage.setItem("runset.save.v1", JSON.stringify(game));
        localStorage.setItem("runset.language", locale);
      },
      { game, locale },
    );
    let release!: () => void, finished!: () => void;
    const gate = new Promise<void>((done) => (release = done)),
      loaded = new Promise<void>((done) => (finished = done));
    await page.route(
      /\/(?:src\/ui\/Setup\.tsx|assets\/Setup-[^/]+\.js)(?:\?.*)?$/,
      async (route) => {
        await gate;
        await route.continue();
        finished();
      },
    );
    try {
      await page.goto("/");
      await page
        .getByRole("button", { name: t("New game →"), exact: true })
        .click();
      await expect(page.getByRole("main")).toHaveAttribute("aria-busy", "true");
      await page.getByRole("button", { name: t("Home"), exact: true }).click();
      release();
      await loaded;
      await expect(
        page.getByRole("button", { name: t("Continue game →"), exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: t("Ready to play?"), exact: true }),
      ).toHaveCount(0);
      expect(
        await page.evaluate(() =>
          JSON.parse(localStorage.getItem("runset.save.v1")!),
        ),
      ).toEqual(game);
    } finally {
      release();
    }
  });

test("finishing a round during a slow results download keeps one skip target", async ({
  page,
}) => {
  const game = practiceGame();
  game.players[0].rack = [9, 35, 61];
  game.turnStart.rack = [9, 35, 61];
  const used = new Set(game.players.flatMap((p) => p.rack));
  game.pool = Array.from({ length: 106 }, (_, i) => i).filter(
    (id) => !used.has(id),
  );
  await page.addInitScript(
    (game) => localStorage.setItem("runset.save.v1", JSON.stringify(game)),
    game,
  );
  let release!: () => void;
  const gate = new Promise<void>((done) => (release = done));
  await page.route(
    /\/(?:src\/ui\/GameOver\.tsx|assets\/GameOver-[^/]+\.js)(?:\?.*)?$/,
    async (route) => {
      await gate;
      await route.continue();
    },
  );
  try {
    await page.goto("/");
    await page
      .getByRole("button", { name: "Continue game →", exact: true })
      .click();
    for (const id of [9, 35, 61])
      await page.locator(`.rack [data-tile-id="${id}"]`).click();
    await page.locator(".new-meld").click();
    await page.getByRole("button", { name: "End turn →", exact: true }).click();
    await expect(page.getByRole("main")).toHaveAttribute("aria-busy", "true");
    await expect(page.locator("#main-content")).toHaveCount(1);
    const skip = page.getByRole("link", {
      name: "Skip to content",
      exact: true,
    });
    await skip.focus();
    await skip.press("Enter");
    await expect(page.getByRole("main")).toBeFocused();
    release();
    await expect(
      page.getByRole("heading", { name: "Beautifully played.", exact: true }),
    ).toBeFocused();
  } finally {
    release();
  }
});
