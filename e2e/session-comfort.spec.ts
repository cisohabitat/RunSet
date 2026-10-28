import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { landscapePosition } from "./helpers/landscape";
import { validSave } from "../src/lib/storage";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
function position() {
  const game = landscapePosition();
  delete game.match;
  delete game.turnSeconds;
  delete game.deadline;
  game.coach = false;
  return game;
}
async function seed(
  page: Page,
  game: ReturnType<typeof position>,
  locale = "en",
  reading = false,
) {
  await page.emulateMedia({
    reducedMotion: "reduce",
    colorScheme: locale === "en" ? "light" : "dark",
  });
  await page.addInitScript(
    ({ game, locale, reading }) => {
      if (!sessionStorage.getItem("seeded")) {
        localStorage.setItem("runset.save.v1", JSON.stringify(game));
        localStorage.setItem("runset.reading", String(reading));
        localStorage.setItem("runset.contrast", "true");
        sessionStorage.setItem("seeded", "true");
      }
      localStorage.setItem("runset.language", locale);
    },
    { game, locale, reading },
  );
}
const read = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem("runset.save.v1")!));
for (const locale of ["en", "zh-CN"] as const)
  for (const width of [375, 1180])
    test(`${locale} ${width}: break saves unfinished moves and resumes after a long rest`, async ({
      page,
    }, info) => {
      const t = locale === "en" ? (s: string) => s : translator(messages),
        game = position();
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.setViewportSize({ width, height: width === 375 ? 667 : 820 });
      await page.clock.install();
      await seed(page, game, locale, width === 1180);
      await page.goto("/");
      const resume = () =>
        page
          .getByRole("button", { name: t("Continue game →"), exact: true })
          .click();
      await resume();
      await page.locator('.rack [data-tile-id="3"]').click();
      await page.locator(".new-meld").click();
      await expect
        .poll(async () =>
          (await read(page)).table
            .flatMap((m: { tiles: number[] }) => m.tiles)
            .includes(3),
        )
        .toBe(true);
      const draft = await read(page);
      expect(validSave(draft)).toBe(true);
      await page.getByText(t("More"), { exact: true }).click();
      const leave = page.getByRole("button", {
        name: t("Take a break"),
        exact: true,
      });
      await leave.scrollIntoViewIfNeeded();
      expect(
        await leave.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return (
            r.height >= 44 &&
            el.contains(
              document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
            )
          );
        }),
      ).toBe(true);
      await leave.click();
      await expect(page.locator(".home")).toBeVisible();
      await expect(page.locator(".resume-context")).toContainText(
        t("Unfinished moves kept. Check the table before ending your turn."),
      );
      await expect(page.locator(".resume-context")).toContainText(
        t("No timer. Resume whenever you like."),
      );
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "best-practice"])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.clock.fastForward(60 * 60 * 1000);
      expect(await read(page)).toEqual(draft);
      expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
        "hidden",
      );
      await page.screenshot({
        path: `/tmp/runset-break-${info.project.name || "chromium"}-${locale}-${width}.png`,
        fullPage: true,
      });
      await page.reload();
      await expect(page.locator(".resume-context")).toContainText(
        t("Unfinished moves kept. Check the table before ending your turn."),
      );
      await resume();
      await expect(page.locator('.table [data-tile-id="3"]')).toBeVisible();
      expect(await read(page)).toEqual(draft);
      await page
        .getByRole("button", { name: t("Undo move"), exact: true })
        .click();
      await expect
        .poll(async () => (await read(page)).table)
        .toEqual(game.table);
      expect(errors).toEqual([]);
    });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: a failed break save stays on the table and can be retried`, async ({
    page,
  }) => {
    const t = locale === "en" ? (s: string) => s : translator(messages),
      game = position();
    await page.setViewportSize({ width: 375, height: 667 });
    await seed(page, game, locale);
    await page.goto("/");
    await page
      .getByRole("button", { name: t("Continue game →"), exact: true })
      .click();
    await page.evaluate(() => {
      (window as any).__allowSaves = false;
      const set = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) {
        if (k === "runset.save.v1" && !(window as any).__allowSaves)
          throw new DOMException("Full", "QuotaExceededError");
        return set.call(this, k, v);
      };
    });
    await page.locator('.rack [data-tile-id="3"]').click();
    await page.locator(".new-meld").click();
    await expect(page.locator('.table [data-tile-id="3"]')).toBeVisible();
    await page.getByText(t("More"), { exact: true }).click();
    const leave = page.getByRole("button", {
      name: t("Take a break"),
      exact: true,
    });
    await leave.click();
    await expect(page.locator(".notice")).toContainText(
      t("Could not save yet. Keep this tab open and try again."),
    );
    expect(
      await page.locator(".notice").evaluate((el) => {
        const r = el.getBoundingClientRect();
        return r.top >= 0 && r.bottom <= innerHeight;
      }),
    ).toBe(true);
    await expect(page.locator(".table")).toBeVisible();
    expect(await read(page)).toEqual(game);
    await page.evaluate(() => {
      (window as any).__allowSaves = true;
    });
    await leave.click();
    await expect(page.locator(".home")).toBeVisible();
    expect(validSave(await read(page))).toBe(true);
    expect(
      (await read(page)).table.flatMap((m: { tiles: number[] }) => m.tiles),
    ).toContain(3);
    await expect(page.locator(".notice")).toHaveCount(0);
  });
test("a timed break retains its deadline and applies one expiry when returning", async ({
  page,
}) => {
  const game = position(),
    now = Date.now();
  game.turnSeconds = 60;
  game.deadline = now + 60000;
  await page.clock.install({ time: now });
  await seed(page, game);
  await page.goto("/");
  const resume = () =>
    page.getByRole("button", { name: "Continue game →", exact: true }).click();
  await resume();
  await page.locator('.rack [data-tile-id="3"]').click();
  await page.locator(".new-meld").click();
  await page.getByText("More", { exact: true }).click();
  await expect(
    page.getByText("Timed game: the turn deadline still applies.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Take a break", exact: true }).click();
  await expect(page.locator(".resume-context")).toContainText(
    "Timed game: the original deadline still applies. If it has passed, continuing processes the expired turn.",
  );
  expect((await read(page)).deadline).toBe(game.deadline);
  await page.clock.fastForward(65000);
  await resume();
  await expect.poll(async () => (await read(page)).turn).toBe(game.turn + 1);
  const next = await read(page);
  expect(validSave(next)).toBe(true);
  expect(next.table).toEqual(game.table);
  expect(next.players[0].rack).toHaveLength(game.players[0].rack.length + 1);
  expect(next.deadline).toBeGreaterThan(game.deadline!);
});
test("five-second pace persists and delays only the next opponent plan", async ({
  page,
}) => {
  const game = position();
  game.current = 1;
  game.turnStart = {
    table: structuredClone(game.table),
    rack: [...game.players[1].rack],
  };
  await page.clock.install();
  await seed(page, game);
  await page.addInitScript(() => {
    (window as any).__workers = 0;
    (window as any).Worker = class {
      onmessage: ((e: unknown) => void) | null = null;
      constructor() {
        (window as any).__workers++;
        setTimeout(() => this.onmessage?.({ data: { ready: true } }), 0);
      }
      postMessage({ game }: { game: { table: unknown } }) {
        queueMicrotask(() =>
          this.onmessage?.({ data: { result: game.table } }),
        );
      }
      terminate() {}
    };
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByLabel("Opponent pace", { exact: true }).selectOption("5000");
  await expect(
    page.getByText(
      "Pace changes the wait before an opponent plays. Timed turns keep the same limit.",
      { exact: true },
    ),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page.reload();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByLabel("Opponent pace", { exact: true })).toHaveValue(
    "5000",
  );
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Continue game →", exact: true })
    .click();
  await expect(page.locator(".table")).toBeVisible();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.clock.pauseAt(
    new Date(await page.evaluate(() => Date.now() + 1000)),
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.clock.fastForward(4999);
  expect(await page.evaluate(() => (window as any).__workers)).toBe(0);
  await page.clock.runFor(1);
  await expect
    .poll(() => page.evaluate(() => (window as any).__workers))
    .toBe(1);
  await page.clock.runFor(1);
  await expect.poll(async () => (await read(page)).turn).toBe(game.turn + 1);
  expect(validSave(await read(page))).toBe(true);
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page
    .getByRole("button", { name: "Delete saved game", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete game", exact: true }).click();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem("runset.save.v1")))
    .toBeNull();
  expect(await page.evaluate(() => localStorage.getItem("runset.pace"))).toBe(
    "5000",
  );
});
test("leaving the table cancels navigation from a pending break save", async ({
  page,
}) => {
  await seed(page, position());
  await page.goto("/");
  await page
    .getByRole("button", { name: "Continue game →", exact: true })
    .click();
  await expect(page.locator(".table")).toBeVisible();
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        (window as any).__heldLock = navigator.locks.request(
          "runset-game-save",
          () =>
            new Promise<void>((release) => {
              (window as any).__releaseLock = release;
              resolve();
            }),
        );
      }),
  );
  await page.getByText("More", { exact: true }).click();
  await page.getByRole("button", { name: "Take a break", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Saving…", exact: true }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page.getByRole("button", { name: "New game →", exact: true }).click();
  await expect(page.locator(".setup")).toBeVisible();
  await page.evaluate(async () => {
    (window as any).__releaseLock();
    await (window as any).__heldLock;
  });
  // Queue a second lock behind the break write so its cancelled continuation has completed.
  await page.evaluate(() =>
    navigator.locks.request("runset-game-save", () => {}),
  );
  await expect(page.locator(".setup")).toBeVisible();
  await expect(page.locator(".home")).toHaveCount(0);
});
