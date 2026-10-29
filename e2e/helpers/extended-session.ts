import {
  expect,
  type Page,
  type BrowserContext,
  type TestInfo,
  type Locator,
} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { landscapePosition } from "./landscape";
import { chooseView } from "./view";
import { reducer, type GameState } from "../../src/engine/game";
import { validSave } from "../../src/lib/storage";
import { exportBackup } from "../../src/lib/backup";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";

export async function verifyExtendedSession(
  page: Page,
  context: BrowserContext,
  info: TestInfo,
  locale: "en" | "zh-CN",
  timed: boolean,
  offline: boolean,
) {
  const t = locale === "en" ? (s: string) => s : translator(messages);
  const game = landscapePosition(),
    now = Date.now();
  delete game.match;
  game.coach = false;
  if (timed) {
    game.deadline = now + 120000;
    await page.clock.install({ time: now });
  } else {
    delete game.deadline;
    delete game.turnSeconds;
  }
  game.history = Array.from({ length: 100 }, () =>
    structuredClone(game.turnStart),
  );
  expect(validSave(game)).toBe(true);
  let expected = structuredClone(game);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({
    reducedMotion: "reduce",
    colorScheme: locale === "en" ? "light" : "dark",
  });
  await page.addInitScript(
    ({ game, locale, timed }) => {
      // Exercise wider system fallback metrics on every reload, including the
      // native summary's fractional viewport edge after Undo.
      if (locale === "zh-CN" && !timed)
        document.addEventListener("DOMContentLoaded", () => {
          document.documentElement.style.setProperty(
            "--font-ui",
            '"DejaVu Sans", "Noto Sans CJK SC", sans-serif',
          );
        });
      if (sessionStorage.getItem("extended-session-seeded")) return;
      sessionStorage.setItem("extended-session-seeded", "1");
      localStorage.setItem("runset.save.v1", JSON.stringify(game));
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.reading", String(locale === "zh-CN"));
      localStorage.setItem("runset.muted", "true");
      localStorage.setItem("runset.pace", "5000");
    },
    { game, locale, timed },
  );
  const b = (s: string) =>
    page.getByRole("button", { name: t(s), exact: true });
  const bytes = () =>
    page.evaluate(() => localStorage.getItem("runset.save.v1"));
  const state = async (): Promise<GameState> => JSON.parse((await bytes())!);
  const activate = async (el: Locator) => {
    await el.scrollIntoViewIfNeeded();
    // Saving feedback and native scrolling can settle after persisted bytes.
    // Wait for the complete original geometry; never scroll/reposition in the
    // polling callback, so a permanently covered destination still fails.
    await expect
      .poll(() =>
        el.evaluate((el) => {
          const r = el.getBoundingClientRect();
          const hit = document.elementFromPoint(
            r.x + r.width / 2,
            r.y + r.height / 2,
          );
          const valid =
            r.width >= 44 &&
            r.height >= 44 &&
            r.top >= 0 &&
            r.bottom <= innerHeight &&
            r.left >= 0 &&
            r.right <= innerWidth &&
            el.contains(hit);
          return {
            valid,
            rect: r.toJSON(),
            viewport: [innerWidth, innerHeight],
            hit: hit?.outerHTML.slice(0, 200),
          };
        }),
      )
      .toMatchObject({ valid: true });
    if (info.project.name === "firefox-desktop") await el.click();
    else await el.tap();
  };
  const check = async () => {
    await expect.poll(state).toEqual(expected);
    const indicator = page.locator(".game .save-indicator");
    if (await indicator.count()) await expect(indicator).toHaveText(t("Saved"));
    const actual = await state();
    expect(validSave(actual)).toBe(true);
    expect(actual.history!.length).toBeLessThanOrEqual(100);
    const ids = [
      ...actual.pool,
      ...actual.players.flatMap((p) => p.rack),
      ...actual.table.flatMap((m) => m.tiles),
    ];
    expect(ids).toHaveLength(106);
    expect(new Set(ids).size).toBe(106);
  };
  const move = async (target: "new" | "red-run") => {
    await activate(page.locator('.game [data-tile-id="3"]'));
    await activate(
      target === "new"
        ? page.locator(".new-meld")
        : page.locator('[data-meld-id="red-run"] .meld-target'),
    );
    expected = reducer(expected, { type: "move", ids: [3], target });
    await expect(page.locator('.game .tile[aria-pressed="true"]')).toHaveCount(
      0,
    );
  };
  const takeBreak = async () => {
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
  }
  await activate(b("Continue game →"));
  await expect(page.locator(".game")).toBeVisible();
  await check();
  // Warm the same editing UI with a real accepted move. Every later checkpoint
  // returns to this same arrangement, with Undo already at its 100-copy cap.
  await move("new");
  await check();
  const samples: {
    edits: number;
    usedHeap: number;
    nodes: number;
    listeners: number;
    documents: number;
  }[] = [];
  const cdp =
    !timed && context.browser()?.browserType().name() === "chromium"
      ? await context.newCDPSession(page)
      : undefined;
  const sample = async (edits: number) => {
    if (!cdp) return;
    await cdp.send("HeapProfiler.collectGarbage");
    const heap = await cdp.send("Runtime.getHeapUsage"),
      dom = await cdp.send("Memory.getDOMCounters");
    samples.push({
      edits,
      usedHeap: heap.usedSize,
      nodes: dom.nodes,
      listeners: dom.jsEventListeners,
      documents: dom.documents,
    });
  };
  await sample(1);
  const cycles = timed ? 12 : 120;
  for (let i = 1; i <= cycles; i++) {
    await move(i % 2 ? "red-run" : "new");
    if (i % (timed ? 6 : 30) === 0) {
      await check();
      expect((await state()).history).toHaveLength(100);
      if (i % 60 === 0) await sample(i + 1);
    }
  }
  if (samples.length) {
    const first = samples[0],
      last = samples[samples.length - 1];
    expect(last.usedHeap - first.usedHeap).toBeLessThanOrEqual(8 * 1024 * 1024);
    expect(last.nodes - first.nodes).toBeLessThanOrEqual(150);
  }
  // Rotation is a view change: preserve the selected tile and exact save bytes.
  const beforeRotation = await bytes(),
    viewport = page.viewportSize()!;
  await activate(page.locator('.rack [data-tile-id="4"]'));
  await page.setViewportSize({
    width: viewport.height,
    height: viewport.width,
  });
  await expect(page.locator('.rack [data-tile-id="4"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(await bytes()).toBe(beforeRotation);
  await page.setViewportSize(viewport);
  await expect(page.locator('.rack [data-tile-id="4"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await activate(page.locator('.rack [data-tile-id="4"]'));
  await chooseView(page, "wide", t);
  const visibleTable = await page.locator(".table").evaluate((el) => {
    const r = el.getBoundingClientRect();
    return Math.min(r.bottom, innerHeight) - Math.max(0, r.top);
  });
  expect(visibleTable).toBeGreaterThanOrEqual(
    locale === "zh-CN" ? (viewport.width > 720 ? 450 : 300) : 180,
  );
  await page.screenshot({
    path: `/tmp/runset-extended-${info.project.name || "chromium"}-${locale}-${timed ? "timed" : "untimed"}.png`,
  });
  await chooseView(page, "normal", t);
  expect(await bytes()).toBe(beforeRotation);
  let lifecycle = timed
    ? "not exercised in timed case; Home elapsed-time check instead"
    : "not exercised: Chromium lifecycle protocol unavailable";
  if (cdp) {
    try {
      await cdp.send("Page.setWebLifecycleState", { state: "frozen" });
      // Deliberate native frozen dwell, not a wait for application readiness.
      await new Promise((resolve) => setTimeout(resolve, 500));
    } finally {
      await cdp.send("Page.setWebLifecycleState", { state: "active" });
    }
    lifecycle = "native Chromium frozen/active, 500 ms dwell";
    expect(await bytes()).toBe(beforeRotation);
    await cdp.detach();
  }
  // Fail only the real game write. The next edit must remain live while its
  // previous persisted bytes remain recoverable; Take a break performs retry.
  await page.evaluate(() => {
    const w = window as unknown as {
      extendedAllowSave: boolean;
      extendedSet: typeof Storage.prototype.setItem;
    };
    w.extendedAllowSave = false;
    w.extendedSet = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "runset.save.v1" && !w.extendedAllowSave)
        throw new DOMException("Full", "QuotaExceededError");
      return w.extendedSet.call(this, key, value);
    };
  });
  await move("red-run");
  await expect(page.locator(".save-indicator")).toHaveText(t("Not saved"));
  expect(await bytes()).toBe(beforeRotation);
  await takeBreak();
  await expect(page.locator(".notice")).toContainText(
    t("Could not save yet. Keep this tab open and try again."),
  );
  await expect(page.locator(".game")).toBeVisible();
  expect(await bytes()).toBe(beforeRotation);
  await page.evaluate(() => {
    const w = window as unknown as {
      extendedAllowSave: boolean;
      extendedSet: typeof Storage.prototype.setItem;
    };
    w.extendedAllowSave = true;
    Storage.prototype.setItem = w.extendedSet;
  });
  await takeBreak();
  await expect(page.locator(".home")).toBeVisible();
  await check();
  const draft = await bytes();
  await page.reload();
  await activate(b("Continue game →"));
  await check();
  expect(await bytes()).toBe(draft);
  await activate(b("Undo move"));
  expected = reducer(expected, { type: "undo" });
  await check();
  expect(expected.history).toHaveLength(99);
  await takeBreak();
  await expect(page.locator(".home")).toBeVisible();
  const beforeBreak = await bytes();
  if (timed) {
    // Logical elapsed time while Home cancels the game timer. This is not a
    // physical mobile background/battery claim.
    await page.clock.fastForward(20 * 60 * 1000);
    expect(await bytes()).toBe(beforeBreak);
    await activate(b("Continue game →"));
    await expect.poll(async () => (await state()).turn).toBe(game.turn + 1);
    const expired = await state();
    expect(expired.current).toBe(1);
    expect(expired.table).toEqual(game.turnStart.table);
    expect(expired.players[0].rack).toEqual([
      ...game.turnStart.rack,
      game.pool[0],
    ]);
    expect(expired.pool).toEqual(game.pool.slice(1));
    expect(expired.history).toEqual([]);
    expect(expired.deadline!).toBeGreaterThan(game.deadline!);
    expect(
      expired.deadline! - (await page.evaluate(() => Date.now())),
    ).toBeGreaterThan(115000);
    expect(validSave(expired)).toBe(true);
    await activate(
      page
        .locator(".site-header")
        .getByRole("button", { name: t("Home"), exact: true }),
    );
    await expect(page.locator(".home")).toBeVisible();
    expect((await state()).turn).toBe(game.turn + 1);
  } else {
    // Three actual playing -> over transitions, imported through the visible
    // backup flow. Importing a completed fixture would not exercise recording.
    for (let round = 1; round <= 3; round++) {
      const nearWin = landscapePosition();
      nearWin.seed = 700000 + round;
      nearWin.coach = false;
      delete nearWin.match;
      delete nearWin.turnSeconds;
      delete nearWin.deadline;
      nearWin.pool.push(
        ...nearWin.players[0].rack.filter((id) => ![3, 4, 5].includes(id)),
      );
      nearWin.players[0].rack = [3, 4, 5];
      nearWin.turnStart.rack = [3, 4, 5];
      expect(validSave(nearWin)).toBe(true);
      await page
        .getByLabel(t("Import game backup"), { exact: true })
        .setInputFiles({
          name: `round-${round}.json`,
          mimeType: "application/json",
          buffer: Buffer.from(exportBackup(nearWin)),
        });
      await activate(b("Restore backup"));
      await expect.poll(async () => (await state()).seed).toBe(nearWin.seed);
      await expect(page.locator(".game")).toBeVisible();
      for (const id of [3, 4, 5])
        await activate(page.locator(`.rack [data-tile-id="${id}"]`));
      await activate(page.locator(".new-meld"));
      await activate(b("End turn →"));
      await expect(page.locator(".game-over")).toBeVisible();
      await expect
        .poll(
          async () =>
            JSON.parse(
              (await page.evaluate(() =>
                localStorage.getItem("runset.roundHistory.v1"),
              )) || '{"rounds":[]}',
            ).rounds.length,
        )
        .toBe(round);
      await expect.poll(async () => (await state()).phase).toBe("over");
      expect(validSave(await state())).toBe(true);
      await activate(
        page
          .locator(".game-over")
          .getByRole("button", { name: t("Home"), exact: true }),
      );
    }
    await page.reload();
    await expect(page.locator(".home")).toBeVisible();
    expect(
      JSON.parse(
        (await page.evaluate(() =>
          localStorage.getItem("runset.roundHistory.v1"),
        ))!,
      ).rounds,
    ).toHaveLength(3);
  }
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
  const evidence = {
    locale,
    timed,
    browser: info.project.name || "chromium",
    browserVersion: context.browser()?.version(),
    acceptedStressMoves: cycles + 1,
    initialUndo: 100,
    undoAfterReload: 99,
    writeFailureRecovered: true,
    completedRounds: timed ? 0 : 3,
    logicalBreakMinutes: timed ? 20 : 0,
    lifecycle,
    samples,
    heapGrowthLimit: 8 * 1024 * 1024,
    domGrowthLimit: 150,
    physicalDevice: false,
  };
  await info.attach("extended-session-evidence", {
    body: JSON.stringify(evidence, null, 2),
    contentType: "application/json",
  });
  console.log("EXTENDED_SESSION " + JSON.stringify(evidence));
}
