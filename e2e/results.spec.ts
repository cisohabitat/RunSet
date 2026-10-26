import { test, expect, type Page, type Locator } from "@playwright/test";
import { newGame, reducer, results, type GameState } from "../src/engine/game";
import { settingsForGame } from "../src/lib/gameSettings";
import { validSave } from "../src/lib/storage";
import { exportBackup } from "../src/lib/backup";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
function finish({
  match = false,
  champion = false,
}: { match?: boolean; champion?: boolean } = {}) {
  let s = newGame("阿明", 2, "hard", 4321, {
    target: match ? (champion ? 100 : 500) : 0,
    turnSeconds: 120,
    coach: false,
    now: Date.now(),
  });
  s.current = s.players.findIndex((p) => !p.bot);
  s.players[s.current].rack = [9, 35, 61];
  s.table = [];
  s.turnStart = { table: [], rack: [9, 35, 61] };
  const used = new Set([9, 35, 61, 3, 6, 104, 0, 1]);
  const rest = Array.from({ length: 106 }, (_, i) => i).filter(
    (id) => !used.has(id),
  );
  const bots = s.players.filter((p) => p.bot);
  bots[0].rack = [3, 6, 104];
  bots[1].rack = champion ? [0, 1, ...rest.splice(0)] : [0, 1];
  s.pool = rest;
  s = reducer(s, {
    type: "move",
    ids: [9, 35, 61],
    target: "new",
    at: Date.now(),
  });
  s = reducer(s, { type: "endTurn", at: Date.now() });
  expect(validSave(s)).toBe(true);
  return s;
}
function blocked() {
  let s = newGame("阿明", 2, "normal", 17);
  s.current = 0;
  s.pool = [];
  s.table = [];
  s.players[0].rack = [0];
  s.players[1].rack = [26];
  s.players[2].rack = Array.from({ length: 106 }, (_, i) => i).filter(
    (id) => id !== 0 && id !== 26,
  );
  s.turnStart = { table: [], rack: [0] };
  for (let i = 0; i < 3; i++) s = reducer(s, { type: "draw" });
  expect(validSave(s)).toBe(true);
  return s;
}
async function load(page: Page, s: GameState, locale = "en", reading = false) {
  await page.goto("/");
  await page.evaluate(
    ({ s, locale, reading }) => {
      localStorage.setItem("runset.save.v1", JSON.stringify(s));
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.reading", String(reading));
    },
    { s, locale, reading },
  );
  await page.reload();
  await page
    .getByRole("button", {
      name: locale === "zh-CN" ? "查看结果 →" : "View results →",
      exact: true,
    })
    .click();
}
async function hit(locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  expect(
    await locator.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return el.contains(
        document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
      );
    }),
  ).toBe(true);
  await locator.click();
}
for (const [device, width, height, dark, reading] of [
  ["phone", 375, 667, false, false],
  ["tablet", 820, 1180, true, true],
  ["desktop", 1180, 757, false, false],
] as const)
  for (const locale of ["en", "zh-CN"] as const) {
    test(`${device} ${locale}: round reasons, joker arithmetic and replay choices`, async ({
      page,
    }) => {
      const t = locale === "zh-CN" ? translator(messages) : (s: string) => s;
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.setViewportSize({ width, height });
      await page.emulateMedia({
        colorScheme: dark ? "dark" : "light",
        reducedMotion: "reduce",
      });
      const s = finish();
      await load(page, s, locale, reading);
      await expect(
        page.getByLabel(t("Why the round ended"), { exact: true }),
      ).toContainText(
        t("阿明 played their last tile. The first empty rack ends the round."),
      );
      await expect(page.locator(".winner-calculation")).toContainText(
        "41 + 3 = +44",
      );
      const loser = page
        .locator(".scoreboard article")
        .filter({ hasText: "-41" });
      await hit(
        loser.getByText(t("Show remaining tiles and calculation"), {
          exact: true,
        }),
      );
      await expect(loser.locator(".tile-calculation")).toHaveText(
        `4 + 7 + ${t("Joker (30)")} = 41`,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await page.screenshot({
        path: `/tmp/runset-results-${device}-${locale}.png`,
        fullPage: true,
        animations: "disabled",
      });
      const old = await page.evaluate(() =>
        localStorage.getItem("runset.save.v1"),
      );
      await hit(
        page.getByRole("button", {
          name: t("Play again with same settings"),
          exact: true,
        }),
      );
      await expect(page.getByRole("dialog")).toContainText(
        t(
          "A fresh game replaces this saved result. The new deal starts at round 1 with zero match scores; your display and sound preferences stay the same.",
        ),
      );
      await page
        .getByRole("button", { name: t("Keep game"), exact: true })
        .click();
      expect(
        await page.evaluate(() => localStorage.getItem("runset.save.v1")),
      ).toBe(old);
      await hit(
        page.getByRole("button", { name: t("Change settings"), exact: true }),
      );
      await expect(
        page.getByLabel(t("What should we call you?"), { exact: true }),
      ).toHaveValue("阿明");
      await expect(
        page.getByLabel(t("Game length"), { exact: true }),
      ).toHaveValue("0");
      await expect(
        page.getByLabel(t("Time per turn"), { exact: true }),
      ).toHaveValue("120");
      await expect(
        page.getByLabel(t("Show first-game guidance"), { exact: true }),
      ).not.toBeChecked();
      await expect(
        page.getByRole("button", { name: new RegExp(t("Table strategist")) }),
      ).toHaveAttribute("aria-pressed", "true");
      expect(
        await page.evaluate(() => localStorage.getItem("runset.save.v1")),
      ).toBe(old);
      expect(errors).toEqual([]);
    });
  }
test("a blocked tie explains seat order and preserves the winner's own remaining total", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 640 });
  const s = blocked();
  s.players[0].name = "ABCDEFGHIJKLMNOPQRSTUVWX";
  await load(page, s);
  await expect(
    page.getByLabel("Why the round ended", { exact: true }),
  ).toContainText("everyone passed in succession");
  await expect(
    page.getByLabel("Why the round ended", { exact: true }),
  ).toContainText("seat comes first");
  const winner = results(s).find((p) => p.winner)!;
  await expect(page.locator(".winner-card")).toContainText(winner.name);
  await expect(page.locator(".winner-card .round-score strong")).toHaveText(
    `+${winner.score}`,
  );
  await expect(
    page.getByLabel("How scoring works", { exact: true }),
  ).toContainText("their own remaining tiles are not deducted");
  await hit(
    page
      .locator(".scoreboard article")
      .last()
      .getByText("Show remaining tiles and calculation", { exact: true }),
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.reload();
  await page.getByRole("button", { name: /View results/ }).click();
  await expect(
    page.getByLabel("Why the round ended", { exact: true }),
  ).toContainText("seat comes first");
});
test("continuing a match keeps totals while replay resets the match with identical options", async ({
  page,
}) => {
  const s = finish({ match: true });
  await load(page, s);
  await hit(page.getByRole("button", { name: "Deal round 2 →", exact: true }));
  await page.getByRole("button", { name: "Home", exact: true }).click();
  let next = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("runset.save.v1")!),
  );
  expect(next.match.round).toBe(2);
  expect(next.match.totals).toEqual(s.match!.totals);
  await load(page, s);
  await hit(
    page.getByRole("button", {
      name: "Start over with same settings",
      exact: true,
    }),
  );
  await page
    .getByRole("button", { name: "Start new game", exact: true })
    .click();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  next = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("runset.save.v1")!),
  );
  expect(settingsForGame(next)).toEqual(settingsForGame(s));
  expect(next.match.round).toBe(1);
  expect(next.match.totals).toEqual([0, 0, 0]);
  expect(next.match.rounds).toEqual([]);
  expect(next.seed).not.toBe(s.seed);
  expect(next.deadline).toBeGreaterThan(Date.now() + 110000);
  const champion = finish({ match: true, champion: true });
  await load(page, champion);
  await expect(page.getByRole("button", { name: /Deal round/ })).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: "Play again with same settings",
      exact: true,
    }),
  ).toBeVisible();
});
test("changing options and restoring a backup keep replacement promises distinct", async ({
  page,
}) => {
  const s = finish({ match: true });
  await load(page, s);
  await hit(page.getByRole("button", { name: "Change settings", exact: true }));
  await page.getByLabel("Game length", { exact: true }).selectOption("0");
  await page.getByLabel("Time per turn", { exact: true }).selectOption("0");
  await page.getByRole("button", { name: /Deal the tiles/ }).click();
  await page
    .getByRole("button", { name: "Start new game", exact: true })
    .click();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  let current = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("runset.save.v1")!),
  );
  expect(current.match).toBeUndefined();
  expect(current.turnSeconds).toBeUndefined();
  const restore = reducer(s, { type: "nextRound", at: Date.now() });
  await load(page, s);
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: "restore.json",
    mimeType: "application/json",
    buffer: Buffer.from(exportBackup(restore)),
  });
  await expect(page.getByRole("dialog")).not.toContainText(
    "round 1 with zero match scores",
  );
  await page
    .getByRole("button", { name: "Start new game", exact: true })
    .click();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  current = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("runset.save.v1")!),
  );
  expect(current.match.round).toBe(2);
  expect(current.match.totals).toEqual(restore.match!.totals);
  expect(current.deadline).toBe(restore.deadline);
});
