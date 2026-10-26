import { test, expect } from "@playwright/test";
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
