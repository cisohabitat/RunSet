import { test, expect } from "@playwright/test";
import assert from "node:assert/strict";
test("learn, preserve, delete and resize a round", async ({ page: p }) => {
  const errors: string[] = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.goto("/");
  await p.getByRole("button", { name: "New game", exact: false }).click();
  await p.getByRole("button", { name: "Deal the tiles" }).click();
  await p.waitForFunction(() => localStorage.getItem("runset.save.v1") !== null);
  await p.getByRole("button", { name: "Home", exact: true }).click();
  const saved = await p.evaluate(() => localStorage.getItem("runset.save.v1"));
  if (
    !(await p
      .getByRole("button", { name: "Delete saved game", exact: true })
      .isVisible())
  )
    await p.getByLabel("Game menu", { exact: true }).click();
  await p
    .getByRole("button", { name: "Delete saved game", exact: true })
    .click();
  await p.getByRole("button", { name: "Keep game" }).press("Escape");
  assert.equal(
    await p.evaluate(() => localStorage.getItem("runset.save.v1")),
    saved,
  );
  await p.getByRole("button", { name: "Learn to play" }).click();
  for (const names of [
    ["red 10", "blue 10", "orange 10"],
    ["red 1", "red 2", "red 3"],
  ]) {
    for (const name of names)
      await p.getByRole("button", { name, exact: true }).click();
    await p.getByRole("button", { name: /New group or run/ }).click();
  }
  await p.getByRole("button", { name: /I see/ }).click();
  await p.getByRole("button", { name: "End turn →", exact: true }).click();
  await p.getByRole("button", { name: /Watch Juniper/ }).click();
  await p.getByRole("button", { name: /Draw a tile/ }).click();
  await p.getByRole("button", { name: "red 13", exact: true }).first().click();
  await p.getByRole("button", { name: /New group or run/ }).click();
  await p.getByRole("button", { name: /Reset turn/ }).click();
  await p.getByRole("heading", { name: "You know the basics" }).waitFor();
  assert.equal(
    await p.evaluate(() => localStorage.getItem("runset.save.v1")),
    saved,
  );
  await p.getByRole("button", { name: "Exit practice" }).click();
  if (
    !(await p
      .getByRole("button", { name: "Delete saved game", exact: true })
      .isVisible())
  )
    await p.getByLabel("Game menu", { exact: true }).click();
  await p
    .getByRole("button", { name: "Delete saved game", exact: true })
    .click();
  await p.getByRole("button", { name: "Delete game", exact: true }).click();
  await expect(p.getByRole("dialog")).not.toBeVisible();
  await p.reload();
  assert.equal(
    await p.getByRole("button", { name: "Continue game" }).count(),
    0,
  );
  assert.ok(await p.evaluate(() => localStorage.getItem("runset.practice.v1")));
  await p.getByRole("button", { name: "New game", exact: false }).click();
  await p.getByRole("button", { name: "Deal the tiles" }).click();
  await p.waitForFunction(() => {
    const s = JSON.parse(localStorage.getItem("runset.save.v1"));
    return !!s && !s.players[s.current].bot;
  });
  for (const [width, height] of [
    [360, 800],
    [375, 667],
    [390, 844],
    [430, 932],
    [768, 1024],
    [820, 1180],
    [1180, 820],
    [1440, 900],
  ]) {
    await p.setViewportSize({ width, height });
    assert.ok(
      await p.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `${width} overflow`,
    );
    const tile = await p.locator(".rack .tile").first().boundingBox();
    assert.ok(tile.width >= 44 && tile.height >= 44);
  }
  expect(errors).toEqual([]);
});

test("hints preview before placement and penalty warnings keep edits", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const { practiceGame } = await import("/src/engine/practice.ts");
    localStorage.setItem("runset.save.v1", JSON.stringify(practiceGame()));
  });
  await page.reload();
  await page.getByRole("button", { name: "Continue game" }).click();
  const original = await page.evaluate(() =>
    localStorage.getItem("runset.save.v1"),
  );
  await page.getByRole("button", { name: "Show a possible move" }).click();
  const hint = page.getByLabel("Move hint", { exact: true });
  await expect(hint).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Place hint", exact: true }),
    await hint.innerText(),
  ).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("runset.save.v1")),
  ).toBe(original);
  await page.getByRole("button", { name: "Place hint", exact: true }).click();
  expect(await page.locator(".table .tile").count()).toBeGreaterThan(0);
  expect(await page.getByRole("heading", { name: "Your move." }).count()).toBe(
    1,
  );
  await page.getByRole("button", { name: /Reset turn/ }).click();
  await page
    .getByRole("button", { name: "red 13", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: /New group or run/ }).click();
  await page
    .getByRole("button", { name: "+3 tiles · End turn", exact: true })
    .click();
  await page.getByRole("dialog").waitFor();
  await page.getByRole("button", { name: "Keep editing" }).click();
  expect(await page.locator(".table .tile").count()).toBe(1);
  await page
    .getByRole("button", { name: "+3 tiles · End turn", exact: true })
    .click();
  await page.getByRole("button", { name: "Reset turn instead" }).click();
  expect(await page.locator(".table .tile").count()).toBe(0);
  expect(await page.locator(".rack .tile").count()).toBe(14);
});

test("undo and restart retain safe replacement choices", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const { practiceGame } = await import("/src/engine/practice.ts");
    localStorage.setItem("runset.save.v1", JSON.stringify(practiceGame()));
  });
  await page.reload();
  await page.getByRole("button", { name: "Continue game" }).click();
  for (const name of ["red 10", "blue 10", "orange 10"])
    await page.getByRole("button", { name, exact: true }).click();
  await page.getByRole("button", { name: /New group or run/ }).click();
  await page.getByRole("button", { name: "Undo move" }).click();
  expect(await page.locator(".rack .tile").count()).toBe(14);
  expect(await page.locator(".table .tile").count()).toBe(0);
  await page.getByLabel("Game menu", { exact: true }).click();
  await page.getByRole("button", { name: "Restart game" }).click();
  await page.getByRole("button", { name: "Keep game" }).click();
  expect(await page.locator(".rack .tile").count()).toBe(14);
  await page.getByLabel("Game menu", { exact: true }).click();
  await page.getByRole("button", { name: "Restart game" }).click();
  await page
    .getByRole("button", { name: "Start new game", exact: true })
    .click();
  expect(await page.getByRole("region", { name: "Your rack" }).count()).toBe(1);
});

test("crowded tables and fifty-tile racks stay usable on phone and tablet", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const { practiceGame } = await import("/src/engine/practice.ts");
    const s = practiceGame();
    s.table = [0, 26, 52, 78].map((base, i) => ({
      id: `stress-${i}`,
      tiles: Array.from({ length: 13 }, (_, n) => base + n),
    }));
    const table = new Set(s.table.flatMap((m) => m.tiles));
    const remaining = Array.from({ length: 106 }, (_, i) => i).filter(
      (id) => !table.has(id),
    );
    s.players[0].rack = remaining.splice(0, 50);
    s.players[0].melded = true;
    s.players[1].rack = remaining;
    s.pool = [];
    s.turnStart = {
      table: structuredClone(s.table),
      rack: [...s.players[0].rack],
    };
    localStorage.setItem("runset.save.v1", JSON.stringify(s));
  });
  await page.reload();
  await page.getByRole("button", { name: "Continue game" }).click();
  await expect(page.locator(".rack .tile")).toHaveCount(50);
  for (const [width, height] of [
    [360, 800],
    [390, 844],
    [768, 1024],
    [820, 1180],
    [1180, 820],
    [1440, 900],
  ]) {
    await page.setViewportSize({ width, height });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page
      .getByRole("button", { name: "Expand rack", exact: true })
      .click();
    await expect(page.locator(".expanded-rack")).toBeVisible();
    await page
      .getByRole("button", { name: "Compact rack", exact: true })
      .click();
  }
  await page.getByRole("button", { name: "Table end ↓" }).click();
  await page.getByRole("button", { name: "Table start ↑" }).click();
});

test("matches deal subsequent rounds and timed turns draw on expiry", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "New game", exact: false }).click();
  await page.getByText("More game options", { exact: true }).click();
  await page.getByLabel("Game length").selectOption("500");
  await page.getByLabel("Time per turn").selectOption("60");
  await page.getByRole("button", { name: "Deal the tiles" }).click();
  await expect(page.getByRole("timer")).toHaveCount(1);
  await expect(page.getByLabel("Match scores")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem("runset.save.v1")!)?.match?.target,
      ),
    )
    .toBe(500);
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page.evaluate(async () => {
    const { practiceGame } = await import("/src/engine/practice.ts");
    const s = practiceGame();
    s.pool.push(...s.players[0].rack.filter((id) => ![9, 35, 61].includes(id)));
    s.players[0].rack = [9, 35, 61];
    s.turnStart = { table: [], rack: [9, 35, 61] };
    s.match = { target: 500, round: 1, totals: [0, 0], rounds: [] };
    localStorage.setItem("runset.save.v1", JSON.stringify(s));
  });
  await page.reload();
  await page.getByRole("button", { name: "Continue game" }).click();
  for (const name of ["red 10", "blue 10", "orange 10"])
    await page.getByRole("button", { name, exact: true }).click();
  await page.getByRole("button", { name: /New group or run/ }).click();
  await page.getByRole("button", { name: "End turn →", exact: true }).click();
  await expect(page.getByLabel("Match scoreboard")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem("runset.save.v1")!).phase,
      ),
    )
    .toBe("over");
  await page.reload();
  await page.getByRole("button", { name: "View results" }).click();
  await page.getByRole("button", { name: "Deal round 2" }).click();
  await expect(page.locator(".rack")).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem("runset.save.v1")!).match.round,
      ),
    )
    .toBe(2);
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page.evaluate(async () => {
    const { practiceGame } = await import("/src/engine/practice.ts");
    const s = practiceGame();
    s.turnSeconds = 60;
    s.deadline = Date.now() + 500;
    localStorage.setItem("runset.save.v1", JSON.stringify(s));
  });
  await page.reload();
  await page.getByRole("button", { name: "Continue game" }).click();
  await page.waitForFunction(() =>
    JSON.parse(localStorage.getItem("runset.save.v1")!).notice.startsWith(
      "Time’s up.",
    ),
  );
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("runset.save.v1")!).players[0].rack
          .length,
    ),
  ).toBe(15);
});

test("a timed-out penalty dialog cannot penalize the next player", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const { practiceGame } = await import("/src/engine/practice.ts");
    const s = practiceGame();
    s.turnSeconds = 60;
    s.deadline = Date.now() + 2000;
    localStorage.setItem("runset.save.v1", JSON.stringify(s));
  });
  await page.reload();
  await page.getByRole("button", { name: "Continue game" }).click();
  await page
    .getByRole("button", { name: "red 13", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: /New group or run/ }).click();
  await page
    .getByRole("button", { name: "+3 tiles · End turn", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("runset.save.v1")!).players[0].rack
          .length,
    ),
  ).toBe(15);
});

test("delete during a bot turn cancels work and storage errors preserve the game", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const { practiceGame } = await import("/src/engine/practice.ts");
    const s = practiceGame();
    s.current = 1;
    s.turnStart = { table: [], rack: [...s.players[1].rack] };
    localStorage.setItem("runset.save.v1", JSON.stringify(s));
  });
  await page.reload();
  await page.clock.install();
  await page.getByRole("button", { name: "Continue game" }).click();
  if (
    !(await page
      .getByRole("button", { name: "Delete saved game", exact: true })
      .isVisible())
  )
    await page.getByLabel("Game menu", { exact: true }).click();
  await page
    .getByRole("button", { name: "Delete saved game", exact: true })
    .click();
  const saved = await page.evaluate(() =>
    localStorage.getItem("runset.save.v1"),
  );
  await page.clock.fastForward(3000);
  expect(
    await page.evaluate(() => localStorage.getItem("runset.save.v1")),
  ).toBe(saved);
  await page.evaluate(() => {
    const remove = Storage.prototype.removeItem;
    Storage.prototype.removeItem = function (key) {
      if (key === "runset.save.v1") throw Error("Storage denied");
      return remove.call(this, key);
    };
  });
  await page.getByRole("button", { name: "Delete game", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(
    await page.evaluate(() => localStorage.getItem("runset.save.v1")),
  ).toBe(saved);
  await page.getByRole("button", { name: "Keep game" }).click();
  await page.reload();
  if (
    !(await page
      .getByRole("button", { name: "Delete saved game", exact: true })
      .isVisible())
  )
    await page.getByLabel("Game menu", { exact: true }).click();
  await page
    .getByRole("button", { name: "Delete saved game", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete game", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.reload();
  expect(
    await page.evaluate(() => localStorage.getItem("runset.save.v1")),
  ).toBeNull();
  await expect(page.getByRole("button", { name: "Continue game" })).toHaveCount(
    0,
  );
});
