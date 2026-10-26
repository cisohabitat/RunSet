import { test, expect, type Locator, type Page } from "@playwright/test";
import { newGame, type GameState } from "../src/engine/game";
import { validSave } from "../src/lib/storage";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
test.use({ hasTouch: true });
function position(): GameState {
  const s = newGame("You", 1, "easy", 4321, {
    coach: true,
    target: 500,
    turnSeconds: 120,
    now: Date.now(),
  });
  s.players.sort((a, b) => Number(!!a.bot) - Number(!!b.bot));
  s.current = 0;
  s.players[0].melded = true;
  s.table = [
    { id: "red-run", tiles: [0, 1, 2] },
    { id: "tens", tiles: [9, 35, 61] },
    { id: "blue-run", tiles: [26, 27, 28] },
    { id: "orange-run", tiles: [52, 53, 54] },
    { id: "black-run", tiles: [78, 79, 80] },
    { id: "elevens", tiles: [10, 36, 62] },
  ];
  s.players[0].rack = [3, 4, 5, 6, 7, 8, 12, 25, 51, 77, 103, 104, 105];
  const used = new Set([
      ...s.players[0].rack,
      ...s.table.flatMap((m) => m.tiles),
    ]),
    rest = Array.from({ length: 106 }, (_, i) => i).filter(
      (id) => !used.has(id),
    );
  s.players[1].rack = rest.splice(0, 14);
  s.pool = rest;
  s.turnStart = {
    table: structuredClone(s.table),
    rack: [...s.players[0].rack],
  };
  expect(validSave(s)).toBe(true);
  return s;
}
async function load(
  page: Page,
  s: GameState,
  locale: string,
  reading: boolean,
  wide = false,
) {
  await page.goto("/");
  await page.evaluate(
    ({ s, locale, reading, wide }) => {
      localStorage.setItem("runset.save.v1", JSON.stringify(s));
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.reading", String(reading));
      localStorage.setItem("runset.tableExpanded", String(wide));
      localStorage.setItem("runset.pace", "2400");
    },
    { s, locale, reading, wide },
  );
  await page.reload();
  await page
    .getByRole("button", {
      name: locale === "zh-CN" ? "继续游戏 →" : "Continue game →",
      exact: true,
    })
    .tap();
  await expect(page.locator(".table")).toBeVisible();
}
async function tap(locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  expect(
    await locator.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return el.contains(
        document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
      );
    }),
  ).toBe(true);
  await locator.tap();
}
async function boardBounds(page: Page) {
  return page.locator(".table").evaluate((el) => {
    const r = el.getBoundingClientRect(),
      dock = document.querySelector(".player-dock")!.getBoundingClientRect();
    const full = Array.from(el.querySelectorAll(".meld")).filter((m) => {
      const b = m.getBoundingClientRect();
      return b.top >= r.top && b.bottom <= r.bottom;
    }).length;
    return {
      height: r.height,
      visible: Math.max(
        0,
        Math.min(r.bottom, innerHeight) - Math.max(0, r.top),
      ),
      full,
      overlap: Math.max(0, r.bottom - dock.top),
    };
  });
}
for (const [device, width, height] of [
  ["phone", 375, 667],
  ["iPad", 820, 1180],
  ["landscape iPad", 1180, 820],
] as const)
  for (const locale of ["en", "zh-CN"] as const)
    for (const reading of [false, true])
      test(`${device} ${locale} reading=${reading}: usable board and persistent expanded workspace`, async ({
        page,
      }) => {
        const t = locale === "zh-CN" ? translator(messages) : (s: string) => s,
          errors: string[] = [];
        page.on("pageerror", (e) => errors.push(e.message));
        await page.setViewportSize({ width, height });
        await page.emulateMedia({
          colorScheme: reading ? "dark" : "light",
          reducedMotion: "reduce",
        });
        await load(page, position(), locale, reading);
        const normal = await boardBounds(page);
        expect(normal.height).toBeGreaterThanOrEqual(
          device === "phone" ? 180 : 280,
        );
        if (device === "iPad" && reading)
          expect(normal.height).toBeGreaterThanOrEqual(600);
        const before = await page.evaluate(() =>
          localStorage.getItem("runset.save.v1"),
        );
        await tap(page.locator('.rack [data-tile-id="3"]'));
        await tap(
          page.getByRole("button", { name: t("Expand table"), exact: true }),
        );
        const expanded = await boardBounds(page);
        expect(expanded.visible).toBeGreaterThanOrEqual(
          device === "phone" ? 300 : 450,
        );
        expect(expanded.full).toBeGreaterThanOrEqual(2);
        expect(expanded.overlap).toBe(0);
        await expect(page.locator('.rack [data-tile-id="3"]')).toHaveAttribute(
          "aria-pressed",
          "true",
        );
        expect(
          await page.evaluate(() => localStorage.getItem("runset.save.v1")),
        ).toBe(before);
        const draw = page.getByRole("button", {
          name: t("Draw a tile") + " ↓",
          exact: true,
        });
        expect(
          await draw.evaluate(
            (el) => el.getBoundingClientRect().bottom <= innerHeight,
          ),
        ).toBe(true);
        await expect(page.getByRole("timer")).toHaveCount(1);
        await page.screenshot({
          path: `/tmp/runset-roomy-${device}-${locale}-${reading}.png`,
          animations: "disabled",
        });
        await page
          .locator(".table")
          .evaluate((el) => el.scrollTo({ top: el.scrollHeight }));
        await tap(page.locator(".new-meld")); // Actual touch placement while scrolled to the end.
        await expect(page.locator('.table [data-tile-id="3"]')).toHaveCount(1);
        await tap(
          page.getByRole("button", { name: t("Undo move"), exact: true }),
        );
        await tap(
          page.getByRole("button", {
            name: t("Show a possible move"),
            exact: true,
          }),
        );
        await expect(
          page.getByLabel(t("Move hint"), { exact: true }),
        ).toBeVisible();
        expect(
          await boardBounds(page).then((b) => b.height),
        ).toBeGreaterThanOrEqual(180);
        const place = page.getByRole("button", {
          name: t("Place hint"),
          exact: true,
        });
        await expect(place).toBeVisible();
        expect(
          await place.evaluate((el) => {
            const r = el.getBoundingClientRect();
            return el.contains(
              document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
            );
          }),
        ).toBe(true);
        await tap(
          page.getByRole("button", { name: t("Dismiss hint"), exact: true }),
        );
        await page.keyboard.press("Escape");
        await expect(
          page.getByRole("button", { name: t("Expand table"), exact: true }),
        ).toBeFocused();
        expect(
          await page.evaluate(() => document.body.style.overflow),
        ).not.toBe("hidden");
        await tap(
          page.getByRole("button", { name: t("Expand table"), exact: true }),
        );
        await page.reload();
        await page
          .getByRole("button", { name: t("Continue game →"), exact: true })
          .tap();
        await expect(page.locator(".game.table-expanded")).toBeVisible();
        await tap(page.locator('.rack [data-tile-id="3"]'));
        await tap(
          page.getByRole("button", {
            name: t("Add selected tiles to meld 1"),
            exact: true,
          }),
        );
        await tap(
          page.getByRole("button", { name: t("End turn →"), exact: true }),
        );
        await expect(page.locator(".game.table-expanded")).toBeVisible();
        await page.keyboard.press("Escape");
        await expect(
          page.getByRole("button", { name: t("Expand table"), exact: true }),
        ).toBeFocused();
        expect(errors).toEqual([]);
      });
for (const reading of [false, true])
  test(`short landscape keeps board controls reachable (reading=${reading})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 844, height: 390 });
    await load(page, position(), "en", reading, true);
    await expect(page.locator(".game.table-expanded")).toBeVisible();
    const b = await boardBounds(page);
    expect(b.height).toBeGreaterThanOrEqual(140);
    expect(b.overlap).toBe(0);
    expect(
      await page
        .getByRole("button", { name: /Draw a tile/ })
        .evaluate((el) => el.getBoundingClientRect().bottom <= innerHeight),
    ).toBe(true);
    await page.keyboard.press("Escape");
    expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
      "hidden",
    );
  });
test("finishing a round releases expanded-view scrolling and keeps the preference", async ({
  page,
}) => {
  const s = position();
  s.players[0].rack = [3];
  const used = new Set([3, ...s.table.flatMap((m) => m.tiles)]),
    rest = Array.from({ length: 106 }, (_, i) => i).filter(
      (id) => !used.has(id),
    );
  s.players[1].rack = rest.splice(0, 14);
  s.pool = rest;
  s.turnStart = { table: structuredClone(s.table), rack: [3] };
  await load(page, s, "en", false, true);
  await tap(page.locator('.rack [data-tile-id="3"]'));
  await tap(page.locator(".new-meld"));
  await tap(
    page.getByRole("button", { name: "+3 tiles · End turn", exact: true }),
  );
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".game.table-expanded")).toBeVisible();
  await tap(page.getByRole("button", { name: "Reset turn", exact: true }));
  await tap(page.locator('.rack [data-tile-id="3"]'));
  await tap(
    page.getByRole("button", {
      name: "Add selected tiles to meld 1",
      exact: true,
    }),
  );
  await tap(page.getByRole("button", { name: "End turn →", exact: true }));
  await expect(
    page.getByRole("heading", { name: "Beautifully played.", exact: true }),
  ).toBeVisible();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
    "hidden",
  );
  expect(
    await page.evaluate(() => localStorage.getItem("runset.tableExpanded")),
  ).toBe("true");
});
test("phone practice has a full-sized meld area rather than a clipped row", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await page.getByRole("button", { name: /Learn to play/ }).tap();
  expect(
    await page
      .locator(".table")
      .evaluate((el) => el.getBoundingClientRect().height),
  ).toBeGreaterThanOrEqual(280);
  await page.getByRole("button", { name: "Jokers", exact: true }).tap();
  const bounds = await boardBounds(page);
  expect(bounds.full).toBeGreaterThanOrEqual(1);
  await tap(page.locator('.rack [data-tile-id="4"]'));
  await tap(
    page.getByRole("button", {
      name: "Add selected tiles to meld 1",
      exact: true,
    }),
  );
  await expect(
    page.getByRole("heading", { name: "Reuse the table joker", exact: true }),
  ).toBeVisible();
});
