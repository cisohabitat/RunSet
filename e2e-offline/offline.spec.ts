import { test, expect } from "@playwright/test";
import { mockSpeech } from "../e2e/helpers/speech";
import { readFile, writeFile } from "node:fs/promises";
test("production assets, lessons and a saved round survive offline reload", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await page.getByRole("button", { name: "New game", exact: false }).click();
  await page.getByRole("button", { name: "Deal the tiles" }).click();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  const saved = await page.evaluate(() =>
    localStorage.getItem("runset.save.v1"),
  );
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("button", { name: "Continue game" }).click();
  await expect(page.getByRole("region", { name: "Your rack" })).toBeVisible();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page.getByRole("button", { name: "Learn to play" }).click();
  await expect(
    page.getByRole("heading", { name: "Make a group" }),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("runset.save.v1")),
  ).toBe(saved);
  await context.setOffline(false);
});
test("an explicit worker update keeps the saved game", async ({ page }) => {
  const original = await readFile("dist/sw.js", "utf8");
  try {
    await page.goto("/");
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await page.getByRole("button", { name: "New game", exact: false }).click();
    await page.getByRole("button", { name: "Deal the tiles" }).click();
    await page.getByRole("button", { name: "Home", exact: true }).click();
    const saved = await page.evaluate(() =>
      localStorage.getItem("runset.save.v1"),
    );
    await writeFile(
      "dist/sw.js",
      original.replace(/runset-[a-f0-9]{16}/, "runset-update-fixture"),
    );
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      await registration?.update();
    });
    await Promise.all([
      page.waitForEvent(
        "framenavigated",
        (frame) => frame === page.mainFrame(),
      ),
      page.getByRole("button", { name: "Save and update" }).click(),
    ]);
    await page.waitForLoadState("domcontentloaded");
    await expect(
      page.getByRole("button", { name: "Continue game" }),
    ).toBeVisible();
    expect(
      await page.evaluate(() => localStorage.getItem("runset.save.v1")),
    ).toBe(saved);
  } finally {
    await writeFile("dist/sw.js", original);
  }
});

test("offline readiness is verified and an update preserves another tab", async ({
  page,
  context,
}) => {
  const original = await readFile("dist/sw.js", "utf8");
  try {
    await page.goto("/");
    await expect(
      page.getByRole("status").filter({ hasText: "Ready offline" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "New game", exact: false }).click();
    await page.getByRole("button", { name: "Deal the tiles" }).click();
    await page.getByRole("button", { name: "Home", exact: true }).click();
    await expect(page.getByText("Saved", { exact: true })).toBeVisible();
    const saved = await page.evaluate(() =>
      localStorage.getItem("runset.save.v1"),
    );
    const other = await context.newPage();
    await other.goto("/");
    await expect(
      other.getByRole("status").filter({ hasText: "Ready offline" }),
    ).toBeVisible();
    let navigations = 0;
    other.on("framenavigated", (frame) => {
      if (frame === other.mainFrame()) navigations++;
    });
    await writeFile(
      "dist/sw.js",
      original.replace(/runset-[a-f0-9]{16}/, "runset-multiple-tabs"),
    );
    await page.evaluate(async () => {
      await (await navigator.serviceWorker.getRegistration())?.update();
    });
    await Promise.all([
      page.waitForEvent(
        "framenavigated",
        (frame) => frame === page.mainFrame(),
      ),
      page.getByRole("button", { name: "Save and update" }).click(),
    ]);
    await expect(
      page.getByRole("button", { name: "Continue game" }),
    ).toBeVisible();
    await expect(
      other.getByRole("button", { name: "Continue game" }),
    ).toBeVisible();
    expect(navigations).toBe(0);
    expect(
      await other.evaluate(() => localStorage.getItem("runset.save.v1")),
    ).toBe(saved);
  } finally {
    await writeFile("dist/sw.js", original);
  }
});

test("both languages, rules and lessons remain available after an offline reload", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("status").filter({ hasText: "Ready offline" }),
  ).toBeVisible();
  // Do not fetch Chinese before disconnecting: its separate chunk must be cached.
  await context.setOffline(true);
  await page.getByLabel("语言 / Language").selectOption("zh-CN");
  await expect(page.getByRole("button", { name: /学习玩法/ })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("语言 / Language")).toHaveValue("zh-CN");
  await page.getByRole("button", { name: /学习玩法/ }).click();
  await expect(
    page.getByRole("heading", { name: "组成同数组", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "首页", exact: true }).click();
  await page
    .getByRole("button", { name: /玩法说明/ })
    .first()
    .click();
  await expect(
    page.getByRole("heading", { name: "数字相同，颜色不同。", exact: true }),
  ).toBeVisible();
  await page.getByLabel("语言 / Language").selectOption("en");
  await expect(
    page.getByRole("heading", {
      name: "Same number. Different colours.",
      exact: true,
    }),
  ).toBeVisible();
  await context.setOffline(false);
});

test("comfortable reading and settings load for the first time offline", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("status").filter({ hasText: "Ready offline" }),
  ).toBeVisible();
  await context.setOffline(true);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Settings", exact: true });
  await dialog.getByLabel("Comfortable reading", { exact: true }).check();
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(page.locator(".app")).toHaveClass(/comfortable-reading/);
  await page.getByRole("button", { name: /Learn to play/ }).click();
  await expect(
    page.getByRole("heading", { name: "Make a group", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(
    dialog.getByLabel("Comfortable reading", { exact: true }),
  ).toBeChecked();
  await page.keyboard.press("Escape");
  await context.setOffline(false);
});

test("new-game setup and default guidance are ready before the first offline game", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("status").filter({ hasText: "Ready offline" }),
  ).toBeVisible();
  await context.setOffline(true);
  await page.getByRole("button", { name: /New game/ }).click();
  await expect(
    page.getByLabel("Show first-game guidance", { exact: true }),
  ).toBeChecked();
  await page.getByRole("button", { name: /Deal the tiles/ }).click();
  await expect(page.getByLabel("First real game guidance")).toBeVisible();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /Continue game/ }),
  ).toBeVisible();
  await context.setOffline(false);
});

test("first-use results, score calculations and replay work offline", async ({
  page,
  context,
}) => {
  const { newGame, reducer } = await import("../src/engine/game");
  let s = newGame("You", 1, "easy", 4321, { coach: false });
  s.current = s.players.findIndex((p) => !p.bot);
  const rack = [9, 35, 61],
    rest = Array.from({ length: 106 }, (_, i) => i).filter(
      (id) => !rack.includes(id),
    );
  s.players[s.current].rack = rack;
  s.players[1 - s.current].rack = rest.splice(0, 14);
  s.pool = rest;
  s.turnStart = { table: [], rack: [...rack] };
  s = reducer(s, { type: "move", ids: rack, target: "new" });
  s = reducer(s, { type: "endTurn" });
  await page.goto("/");
  await expect(
    page.getByRole("status").filter({ hasText: "Ready offline" }),
  ).toBeVisible();
  await page.evaluate(
    (s) => localStorage.setItem("runset.save.v1", JSON.stringify(s)),
    s,
  );
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("button", { name: /View results/ }).click();
  await expect(
    page.getByLabel("Why the round ended", { exact: true }),
  ).toContainText("played their last tile");
  await page
    .getByText("Show remaining tiles and calculation", { exact: true })
    .click();
  await expect(page.locator(".tile-calculation")).toBeVisible();
  await page
    .getByRole("button", { name: "Play again with same settings", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Start new game", exact: true })
    .click();
  await expect(
    page.getByRole("region", { name: "Your rack", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("runset.save.v1")!),
  );
  expect(saved.players.filter((p) => p.bot)).toHaveLength(1);
  expect(saved.players.find((p) => p.bot).bot).toBe("easy");
  expect(saved.coach).not.toBe(true);
  await context.setOffline(false);
});

test("first-use expanded game view and its remembered preference work offline", async ({
  page,
  context,
}) => {
  const { newGame } = await import("../src/engine/game");
  const game = newGame("You", 1, "easy", 4321);
  game.current = game.players.findIndex((player) => !player.bot);
  game.turnStart = { table: [], rack: [...game.players[game.current].rack] };
  await page.goto("/");
  await expect(
    page.getByRole("status").filter({ hasText: "Ready offline" }),
  ).toBeVisible();
  await page.evaluate((game) => {
    localStorage.setItem("runset.save.v1", JSON.stringify(game));
    localStorage.setItem("runset.tableExpanded", "true");
  }, game);
  await context.setOffline(true);
  await page.reload();
  await page.getByRole("button", { name: /Continue game/ }).click();
  await expect(page.locator(".game.table-expanded")).toBeVisible();
  await page
    .getByRole("button", { name: "Compact table", exact: true })
    .click();
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe(
    "hidden",
  );
  await page.getByRole("button", { name: "Expand table", exact: true }).click();
  await page.reload();
  await page.getByRole("button", { name: /Continue game/ }).click();
  await expect(page.locator(".game.table-expanded")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("button", { name: "Expand table", exact: true }),
  ).toBeFocused();
  await context.setOffline(false);
});

for (const localService of [true, false]) {
  test(`first-use Mandarin lesson offline with ${localService ? "installed" : "network-only"} voice`, async ({
    page,
    context,
  }) => {
    await mockSpeech(page, { voices: [{ lang: "zh-CN", localService }] });
    await page.goto("/");
    await expect(
      page.getByRole("status").filter({ hasText: "Ready offline" }),
    ).toBeVisible();
    await page.evaluate(() => localStorage.setItem("runset.language", "zh-CN"));
    await context.setOffline(true);
    await page.reload();
    await page.getByRole("button", { name: /学习玩法/ }).click();
    await page.getByRole("button", { name: "听一听", exact: true }).click();
    if (localService) {
      expect(
        await page.evaluate(() => (window as any).__speech.spoken[0].lang),
      ).toBe("zh-CN");
      await page.getByRole("button", { name: "停止朗读" }).click();
    } else {
      await expect(page.locator(".audio-note")).toContainText("此语音需要联网");
      expect(
        await page.evaluate(() => (window as any).__speech.spoken),
      ).toEqual([]);
    }
    await expect(page.locator("#practice-instructions")).not.toBeEmpty();
    await context.setOffline(false);
  });
}
