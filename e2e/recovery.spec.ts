import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { landscapePosition } from "./helpers/landscape";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
import { validSave } from "../src/lib/storage";
const settings =
  /\/(?:src\/ui\/Settings\.tsx|assets\/Settings-[^/]+\.js)(?:\?.*)?$/;
const gameModule = /\/(?:src\/ui\/Game\.tsx|assets\/Game-[^/]+\.js)(?:\?.*)?$/;
const position = () => {
  const game = landscapePosition();
  game.coach = false;
  delete game.turnSeconds;
  delete game.deadline;
  return game;
};
async function seed(
  page: Page,
  game: ReturnType<typeof position>,
  locale = "en",
) {
  await page.addInitScript(
    ({ game, locale }) => {
      if (!localStorage.getItem("runset.save.v1"))
        localStorage.setItem("runset.save.v1", JSON.stringify(game));
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.muted", "true");
    },
    { game, locale },
  );
}
for (const locale of ["en", "zh-CN"] as const)
  for (const failed of ["settings", "game"])
    test(`${locale} ${failed}: failed view keeps readable recovery and saved progress`, async ({
      page,
    }) => {
      const t = locale === "en" ? (s: string) => s : translator(messages);
      const game = position();
      await seed(page, game, locale);
      await page.route(failed === "settings" ? settings : gameModule, (route) =>
        route.abort(),
      );
      await page.goto("/");
      await page
        .getByRole("button", { name: t("Continue game →"), exact: true })
        .click();
      if (failed === "settings") {
        await expect(page.locator(".table")).toBeVisible();
        await page
          .getByRole("button", { name: t("Settings"), exact: true })
          .click();
      }
      await expect(
        page.getByRole("heading", { name: t("This screen could not open.") }),
      ).toBeFocused();
      const audit = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "best-practice"])
        .analyze();
      expect(audit.violations).toEqual([]);
      await page
        .getByRole("button", { name: t("Return Home"), exact: true })
        .click();
      await expect(
        page.getByRole("button", { name: t("Continue game →"), exact: true }),
      ).toBeVisible();
      expect(
        await page.evaluate(() =>
          JSON.parse(localStorage.getItem("runset.save.v1")!),
        ),
      ).toEqual(game);
    });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: save-and-reload refuses quota failure then restores the current draft`, async ({
    page,
  }) => {
    const t = locale === "en" ? (s: string) => s : translator(messages),
      game = position();
    await seed(page, game, locale);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.emulateMedia({
      colorScheme: locale === "en" ? "light" : "dark",
    });
    let block = true;
    await page.route(settings, (route) =>
      block ? route.abort() : route.continue(),
    );
    await page.goto("/");
    await page
      .getByRole("button", { name: t("Continue game →"), exact: true })
      .click();
    await expect(page.locator(".table")).toBeVisible();
    await page.evaluate(() => {
      (window as any).__allowSaves = false;
      const set = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k: string, v: string) {
        if (k === "runset.save.v1" && !(window as any).__allowSaves)
          throw new DOMException("Full", "QuotaExceededError");
        return set.call(this, k, v);
      };
    });
    await page.locator('.rack [data-tile-id="3"]').click();
    await page.locator(".new-meld").click();
    await expect(page.locator('.table [data-tile-id="3"]')).toBeVisible();
    await page
      .getByRole("button", { name: t("Settings"), exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: t("This screen could not open.") }),
    ).toBeVisible();
    let navigations = 0;
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) navigations++;
    });
    await page
      .getByRole("button", { name: t("Save and reload"), exact: true })
      .click();
    await expect(
      page.getByText(
        t(
          "The current position could not be saved. Keep this tab open and return Home to try again. Your previous save is kept.",
        ),
      ),
    ).toBeVisible();
    expect(navigations).toBe(0);
    expect(
      await page.evaluate(() =>
        JSON.parse(localStorage.getItem("runset.save.v1")!),
      ),
    ).toEqual(game);
    await page.screenshot({
      path: `/tmp/runset-recovery-${locale}.png`,
      fullPage: true,
    });
    block = false;
    await page.evaluate(() => ((window as any).__allowSaves = true));
    await Promise.all([
      page.waitForEvent("framenavigated"),
      page
        .getByRole("button", { name: t("Save and reload"), exact: true })
        .click(),
    ]);
    await page
      .getByRole("button", { name: t("Continue game →"), exact: true })
      .click();
    await expect(page.locator('.table [data-tile-id="3"]')).toBeVisible();
    const restored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem("runset.save.v1")!),
    );
    expect(validSave(restored)).toBe(true);
    expect(restored.turn).toBe(game.turn);
  });
test("closing a tab during a queued save keeps the previous completed write", async ({
  page,
  context,
}) => {
  const game = position();
  await seed(page, game);
  await page.goto("/");
  await page
    .getByRole("button", { name: "Continue game →", exact: true })
    .click();
  await expect(page.locator(".table")).toBeVisible();
  const holder = await context.newPage();
  await holder.goto("/");
  await holder.evaluate(
    () =>
      new Promise<void>((ready) => {
        void navigator.locks.request("runset-game-save", async () => {
          let release!: () => void;
          const held = new Promise<void>((resolve) => (release = resolve));
          (window as any).__releaseSave = release;
          ready();
          await held;
        });
      }),
  );
  await page.locator('.rack [data-tile-id="3"]').click();
  await page.locator(".new-meld").click();
  await expect(page.locator(".save-indicator")).toHaveText("Saving…");
  await page.close();
  await holder.evaluate(async () => {
    (window as any).__releaseSave();
    await navigator.locks.request("runset-game-save", () => true);
  });
  expect(
    await holder.evaluate(() =>
      JSON.parse(localStorage.getItem("runset.save.v1")!),
    ),
  ).toEqual(game);
  const restored = await context.newPage();
  await restored.goto("/");
  await restored
    .getByRole("button", { name: "Continue game →", exact: true })
    .click();
  await expect(restored.locator('.rack [data-tile-id="3"]')).toBeVisible();
});
test("a failed view pauses scheduled bot work until the player recovers", async ({
  page,
}) => {
  const game = position();
  game.current = 1;
  game.turnStart = {
    table: structuredClone(game.table),
    rack: [...game.players[1].rack],
  };
  await seed(page, game);
  await page.clock.install();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("runset.pace", "700");
    const Native = Worker;
    (window as any).__workers = 0;
    (window as any).Worker = function (
      url: string | URL,
      options?: WorkerOptions,
    ) {
      (window as any).__workers++;
      return new Native(url, options);
    };
  });
  await page.route(gameModule, (route) => route.abort());
  await page.goto("/");
  await page
    .getByRole("button", { name: "Continue game →", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "This screen could not open." }),
  ).toBeVisible();
  await page.clock.fastForward(5000);
  expect(await page.evaluate(() => (window as any).__workers)).toBe(0);
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("runset.save.v1")!),
    ),
  ).toEqual(game);
});

test("returning Home cancels a reload that is waiting for a save lock", async ({
  page,
  context,
}) => {
  const game = position();
  await seed(page, game);
  await page.route(settings, (route) => route.abort());
  await page.goto("/");
  await page
    .getByRole("button", { name: "Continue game →", exact: true })
    .click();
  await expect(page.locator(".table")).toBeVisible();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "This screen could not open." }),
  ).toBeVisible();
  const holder = await context.newPage();
  await holder.goto("/");
  await holder.evaluate(
    () =>
      new Promise<void>((ready) => {
        void navigator.locks.request("runset-game-save", async () => {
          let release!: () => void;
          const held = new Promise<void>((resolve) => (release = resolve));
          (window as any).__releaseReload = release;
          ready();
          await held;
        });
      }),
  );
  await page.evaluate(() => {
    const request = navigator.locks.request.bind(navigator.locks);
    (window as any).__saveLocksDone = 0;
    (navigator.locks as any).request = (...args: any[]) =>
      (request as any)(...args).then((result: unknown) => {
        (window as any).__saveLocksDone++;
        return result;
      });
  });
  let navigations = 0;
  page.on("framenavigated", (frame) => {
    if (frame === page.mainFrame()) navigations++;
  });
  await page
    .getByRole("button", { name: "Save and reload", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Saving…", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Return Home", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Continue game →", exact: true }),
  ).toBeVisible();
  await holder.evaluate(() => (window as any).__releaseReload());
  await page.waitForFunction(() => (window as any).__saveLocksDone === 1);
  expect(navigations).toBe(0);
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("runset.save.v1")!),
    ),
  ).toEqual(game);
});

test("returning Home after a failed Settings screen allows bot turns to resume", async ({
  page,
}) => {
  const game = position();
  game.current = 1;
  game.turnStart = {
    table: structuredClone(game.table),
    rack: [...game.players[1].rack],
  };
  await seed(page, game);
  await page.clock.install();
  await page.route(settings, (route) => route.abort());
  await page.goto("/");
  await page
    .getByRole("button", { name: "Continue game →", exact: true })
    .click();
  await expect(page.locator(".table")).toBeVisible();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "This screen could not open." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Return Home", exact: true }).click();
  await page
    .getByRole("button", { name: "Continue game →", exact: true })
    .click();
  await expect(page.locator(".table")).toBeVisible();
  await page.clock.fastForward(5000);
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem("runset.save.v1")!).turn,
      ),
    )
    .toBeGreaterThan(game.turn);
});
