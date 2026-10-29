import {
  expect,
  type Page,
  type BrowserContext,
  type TestInfo,
  type Locator,
} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { fourPlayerMatch, expectedRound } from "../../scripts/match-fixtures";
import { planBot } from "../../src/engine/bot";
import {
  matchWinner,
  reducer,
  turnCheck,
  type GameState,
} from "../../src/engine/game";
import { validSave } from "../../src/lib/storage";
import { importBackup } from "../../src/lib/backup";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";

export async function verifyFullMatch(
  page: Page,
  context: BrowserContext,
  info: TestInfo,
  locale: "en" | "zh-CN",
  offline: boolean,
) {
  const t = locale === "en" ? (s: string) => s : translator(messages),
    initial = fourPlayerMatch(locale === "en" ? 81001 : 81002),
    names = initial.players.map((p) => p.name),
    errors: string[] = [];
  expect(validSave(initial)).toBe(true);
  page.on("pageerror", (e) => errors.push(e.message));
  await page.clock.install({ time: Date.now() });
  await page.emulateMedia({
    reducedMotion: "reduce",
    colorScheme: locale === "en" ? "light" : "dark",
  });
  await page.addInitScript(
    ({ initial, locale }) => {
      if (sessionStorage.getItem("full-match-seeded")) return;
      sessionStorage.setItem("full-match-seeded", "1");
      localStorage.setItem("runset.save.v1", JSON.stringify(initial));
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.reading", String(locale === "zh-CN"));
      localStorage.setItem("runset.pace", "5000");
      localStorage.setItem("runset.muted", "true");
    },
    { initial, locale },
  );
  const b = (s: string) =>
    page.getByRole("button", { name: t(s), exact: true });
  const bytes = () =>
    page.evaluate(() => localStorage.getItem("runset.save.v1"));
  const state = async (): Promise<GameState> => JSON.parse((await bytes())!);
  const history = () =>
    page.evaluate(() => localStorage.getItem("runset.roundHistory.v1"));
  const activate = async (el: Locator) => {
    await el.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        el.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return (
            r.width >= 44 &&
            r.height >= 44 &&
            r.left >= 0 &&
            r.right <= innerWidth &&
            r.top >= 0 &&
            r.bottom <= innerHeight &&
            el.contains(
              document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
            )
          );
        }),
      )
      .toBe(true);
    if (info.project.name === "firefox-desktop") await el.click();
    else await el.tap();
  };
  const check = (s: GameState) => {
    expect(validSave(s)).toBe(true);
    expect(s.players.map((p) => p.name)).toEqual(names);
    const ids = [
      ...s.pool,
      ...s.players.flatMap((p) => p.rack),
      ...s.table.flatMap((m) => m.tiles),
    ];
    expect(ids).toHaveLength(106);
    expect(new Set(ids).size).toBe(106);
    expect(s.match!.totals).toEqual(
      names.map((_, i) =>
        s.match!.rounds.reduce((sum, r) => sum + r.scores[i], 0),
      ),
    );
  };
  const finishCheck = async () => {
    await expect.poll(async () => (await state()).phase).toBe("over");
    const s = await state();
    check(s);
    expect(s.match!.rounds.at(-1)).toEqual(expectedRound(s));
    await expect
      .poll(
        async () =>
          JSON.parse((await history()) ?? '{"rounds":[]}').rounds.length,
      )
      .toBe(s.match!.round);
    return s;
  };
  const leave = async () => {
    const more = page.locator(".more-actions");
    if (!(await more.evaluate((el: HTMLDetailsElement) => el.open)))
      await activate(more.locator(":scope > summary"));
    await activate(b("Take a break"));
  };
  await page.goto("/");
  if (offline) {
    await expect(
      page.getByRole("status").filter({ hasText: t("Ready offline") }),
    ).toBeVisible();
    await context.setOffline(true);
    await page.reload();
  }
  await activate(b("Continue game →"));
  for (const id of [32, 31, 33])
    await activate(page.locator(`.game [data-tile-id="${id}"]`));
  await activate(page.locator(".new-meld"));
  await activate(b("End turn →"));
  let over = await finishCheck();
  expect(over.match!.totals).toEqual([102, -14, -20, -68]);
  expect(matchWinner(over)).toBeNull();
  // Reopening a completed round must neither duplicate history nor credit scores twice.
  const first = await bytes(),
    firstHistory = await history();
  await page.reload();
  await activate(b("View results →"));
  expect(await bytes()).toBe(first);
  expect(await history()).toBe(firstHistory);
  await activate(
    page
      .locator(".game-over")
      .getByRole("button", { name: t("Home"), exact: true }),
  );
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    activate(b("Export game backup")),
  ]);
  const backup = await readFile((await download.path())!, "utf8");
  expect(importBackup(backup)).toEqual(over);
  const malformed = JSON.parse(backup);
  malformed.game.match.rounds[0].scores[0]++;
  malformed.game.match.totals[0]++;
  await page
    .getByLabel(t("Import game backup"), { exact: true })
    .setInputFiles({
      name: "impossible-score.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(malformed)),
    });
  await expect(page.locator(".save-tools")).toContainText(
    t("This is not a supported, complete RunSet backup. Your current game is unchanged."),
  );
  expect(await bytes()).toBe(first);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await activate(b("View results →"));
  // The fresh deal remains live if its first write fails; the completed round is still recoverable.
  await page.evaluate(() => {
    const w = window as unknown as {
      matchSet: typeof Storage.prototype.setItem;
      matchWrites: boolean;
    };
    w.matchSet = Storage.prototype.setItem;
    w.matchWrites = false;
    Storage.prototype.setItem = function (k, v) {
      if (k === "runset.save.v1" && !w.matchWrites)
        throw new DOMException("Full", "QuotaExceededError");
      return w.matchSet.call(this, k, v);
    };
  });
  await activate(b("Deal round 2 →"));
  await expect(page.locator(".game .save-indicator")).toHaveText(
    t("Not saved"),
  );
  expect(await bytes()).toBe(first);
  await leave();
  await expect(page.locator(".notice")).toContainText(
    t("Could not save yet. Keep this tab open and try again."),
  );
  await page.evaluate(() => {
    const w = window as unknown as {
      matchSet: typeof Storage.prototype.setItem;
      matchWrites: boolean;
    };
    w.matchWrites = true;
    Storage.prototype.setItem = w.matchSet;
  });
  await leave();
  await expect(page.locator(".home")).toBeVisible();
  let fresh = await state();
  check(fresh);
  expect(fresh.match!.round).toBe(2);
  expect(fresh.match!.totals).toEqual(over.match!.totals);
  expect(fresh.current).toBe(1);
  expect(fresh.players.every((p) => p.rack.length === 14)).toBe(true);
  expect(fresh.table).toEqual([]);
  expect(fresh.pool).toHaveLength(50);
  expect(fresh.history).toEqual([]);
  const savedFresh = await bytes();
  await page.clock.fastForward(60000);
  expect(await bytes()).toBe(savedFresh);
  await page.reload();
  await activate(b("Continue game →"));
  expect(await bytes()).toBe(savedFresh);
  let recoveredDraft = false,
    actions = 0,
    rounds = 1;
  while (matchWinner(await state()) === null && actions < 400) {
    const s = await state();
    check(s);
    if (s.phase === "over") {
      over = await finishCheck();
      rounds = over.match!.round;
      if (matchWinner(over) !== null) break;
      expect(rounds).toBeLessThan(4);
      await activate(b(`Deal round ${rounds + 1} →`));
      continue;
    }
    const beforeTurn = s.turn;
    if (s.players[s.current].bot) {
      await expect(page.locator(".status-line")).toHaveAttribute(
        "data-turn-state",
        "waiting",
      );
      await page.clock.runFor(20);
      await page.clock.fastForward(5000);
    } else {
      const ready = turnCheck(s);
      if (!ready.played.length) {
        const safe = structuredClone(s);
        safe.history = [];
        safe.log = [];
        safe.players[safe.current].bot = "easy";
        safe.players.forEach((p, i) => {
          if (i !== safe.current) p.rack = [];
        });
        const table = planBot(safe, 20),
          newMelds = table.filter((m) =>
            m.tiles.some((id) => s.players[s.current].rack.includes(id)),
          );
        if (!newMelds.length) {
          await activate(
            page.getByRole("button", {
              name: new RegExp(t(s.pool.length ? "Draw a tile" : "Pass")),
            }),
          );
        } else {
          const trial = reducer(s, { type: "applyPlan", table });
          expect(trial).not.toBe(s);
          expect(turnCheck(trial).valid).toBe(true);
          for (const m of newMelds) {
            for (const id of m.tiles)
              await activate(page.locator(`.rack [data-tile-id="${id}"]`));
            await activate(page.locator(".new-meld"));
          }
          await expect
            .poll(async () => turnCheck(await state()).valid)
            .toBe(true);
          if (!recoveredDraft) {
            await leave();
            await expect(page.locator(".home")).toBeVisible();
            const draft = await bytes();
            const [d] = await Promise.all([
              page.waitForEvent("download"),
              activate(b("Export game backup")),
            ]);
            const path = (await d.path())!;
            await page.reload();
            await activate(b("Continue game →"));
            expect(await bytes()).toBe(draft);
            await activate(b("Undo move"));
            await activate(
              page
                .locator(".site-header")
                .getByRole("button", { name: t("Home"), exact: true }),
            );
            await page
              .getByLabel(t("Import game backup"), { exact: true })
              .setInputFiles(path);
            await activate(b("Restore backup"));
            await expect.poll(bytes).toBe(draft);
            expect((await state()).match!.totals).toEqual(fresh.match!.totals);
            recoveredDraft = true;
          }
          await activate(b("End turn →"));
        }
      } else {
        expect(ready.valid).toBe(true);
        await activate(b("End turn →"));
      }
    }
    await expect
      .poll(async () => {
        const n = await state();
        return n.phase === "over" || n.turn !== beforeTurn;
      })
      .toBe(true);
    actions++;
  }
  over = await finishCheck();
  expect(matchWinner(over)).not.toBeNull();
  expect(over.match!.round).toBeGreaterThanOrEqual(2);
  expect(recoveredDraft).toBe(true);
  await expect(page.locator(".match-scores")).toBeVisible();
  await expect(page.locator(".match-scores > p")).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    await expect(page.locator(".match-scores > p").nth(i)).toContainText(
      names[i],
    );
    await expect(page.locator(".match-scores > p strong").nth(i)).toHaveText(
      String(over.match!.totals[i]),
    );
  }
  await expect(b(`Deal round ${over.match!.round + 1} →`)).toHaveCount(0);
  const final = await bytes(),
    records = await history();
  await page.reload();
  await activate(b("View results →"));
  expect(await bytes()).toBe(final);
  expect(await history()).toBe(records);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await info.attach("full-match-evidence", {
    body: JSON.stringify({
      locale,
      browser: info.project.name || "chromium",
      seed: initial.seed,
      actualCompletedRounds: over.match!.round,
      freshRounds: over.match!.round - 1,
      actions,
      recoveredDraft,
      scoreTotals: over.match!.totals,
      physicalDevice: false,
    }),
    contentType: "application/json",
  });
  await info.attach("match-results", {
    body: await page.screenshot({ fullPage: true }),
    contentType: "image/png",
  });
  console.log(
    "FULL_MATCH " +
      JSON.stringify({
        locale,
        browser: info.project.name || "chromium",
        seed: initial.seed,
        rounds: over.match!.round,
        actions,
        totals: over.match!.totals,
      }),
  );
}
