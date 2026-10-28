import { test, expect } from "@playwright/test";
import { readFile, writeFile } from "node:fs/promises";

test("failed initial precaching becomes a readable unavailable state and leaves online play usable", async ({
  page,
  context,
}) => {
  await context.route("**/audio/lesson-0-en.mp3", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
  await page.goto("/");
  await expect(
    page.getByText(
      "Offline setup could not finish. Reconnect and reload to try again. Keep this tab open.",
    ),
  ).toBeVisible({ timeout: 15000 });
  await expect(
    page
      .getByRole("status")
      .filter({ hasText: "Offline readiness could not be verified." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "New game →", exact: true }).click();
  await page
    .getByRole("button", { name: "Deal the tiles", exact: false })
    .click();
  await expect(page.locator(".table")).toBeVisible();
});

test("a failed-install cache cannot displace the previous usable version during activation", async ({
  page,
  context,
}) => {
  const original = await readFile("dist/sw.js", "utf8");
  try {
    await page.goto("/");
    await expect(
      page.getByRole("status").filter({ hasText: "Ready offline" }),
    ).toBeVisible();
    const old = await page.evaluate(async () => {
      const name = (await caches.keys()).find((k) => k.startsWith("runset-"))!;
      await (
        await caches.open(name)
      ).put(
        "/assets/prior-view-fixture.js",
        new Response("prior version kept"),
      );
      await caches.open("runset-failed-install-fixture");
      return name;
    });
    await writeFile(
      "dist/sw.js",
      original.replace(/runset-[a-f0-9]{16}/, "runset-quality-complete"),
    );
    await page.evaluate(async () => {
      await (await navigator.serviceWorker.getRegistration())?.update();
    });
    await Promise.all([
      page.waitForEvent("framenavigated"),
      page
        .getByRole("button", { name: "Save and update", exact: true })
        .click(),
    ]);
    await expect(
      page.getByRole("status").filter({ hasText: "Ready offline" }),
    ).toBeVisible();
    const keys = await page.evaluate(() => caches.keys());
    expect(keys).toContain(old);
    expect(keys).not.toContain("runset-failed-install-fixture");
    await context.setOffline(true);
    expect(
      await page.evaluate(
        async () => await (await fetch("/assets/prior-view-fixture.js")).text(),
      ),
    ).toBe("prior version kept");
  } finally {
    await writeFile("dist/sw.js", original);
  }
});

async function stageUpdate(
  page: import("@playwright/test").Page,
  original: string,
  name: string,
) {
  await writeFile("dist/sw.js", original.replace(/runset-[a-f0-9]{16}/, name));
  await page
    .getByRole("button", { name: "Check for updates", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Save and update", exact: true }),
  ).toBeVisible();
}
async function seedRound(page: import("@playwright/test").Page) {
  const { landscapePosition } = await import("../e2e/helpers/landscape");
  const game = landscapePosition();
  game.coach = false;
  delete game.turnSeconds;
  delete game.deadline;
  await page.addInitScript((game) => {
    if (!localStorage.getItem("runset.save.v1"))
      localStorage.setItem("runset.save.v1", JSON.stringify(game));
    localStorage.setItem("runset.muted", "true");
  }, game);
  await page.goto("/");
  await expect(
    page.getByRole("status").filter({ hasText: "Ready offline" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Continue game →", exact: true })
    .click();
  await expect(page.locator(".table")).toBeVisible();
  return game;
}
test("an update refuses a failed save and succeeds after quota recovery", async ({
  page,
}) => {
  const original = await readFile("dist/sw.js", "utf8");
  try {
    const game = await seedRound(page);
    await page.evaluate(() => {
      const set = Storage.prototype.setItem;
      (window as any).__writeAllowed = false;
      Storage.prototype.setItem = function (k: string, v: string) {
        if (k === "runset.save.v1" && !(window as any).__writeAllowed)
          throw new DOMException("Full", "QuotaExceededError");
        return set.call(this, k, v);
      };
    });
    await page.locator('.rack [data-tile-id="3"]').click();
    await page.locator(".new-meld").click();
    await expect(page.locator(".save-indicator")).toHaveText("Not saved");
    await page.getByLabel("Game menu", { exact: true }).click();
    await stageUpdate(page, original, "runset-quota-recovery");
    let navigations = 0;
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) navigations++;
    });
    await page
      .getByRole("button", { name: "Save and update", exact: true })
      .click();
    await expect(
      page.getByText(
        "The update is paused because your game could not be saved. Keep this tab open.",
      ),
    ).toBeVisible();
    expect(navigations).toBe(0);
    expect(
      await page.evaluate(() =>
        JSON.parse(localStorage.getItem("runset.save.v1")!),
      ),
    ).toEqual(game);
    expect(
      await page.evaluate(
        async () =>
          (await navigator.serviceWorker.getRegistration())?.waiting?.state,
      ),
    ).toBe("installed");
    await page.evaluate(() => ((window as any).__writeAllowed = true));
    await Promise.all([
      page.waitForEvent("framenavigated"),
      page
        .getByRole("button", { name: "Save and update", exact: true })
        .click(),
    ]);
    await page
      .getByRole("button", { name: "Continue game →", exact: true })
      .click();
    await expect(page.locator('.table [data-tile-id="3"]')).toBeVisible();
  } finally {
    await writeFile("dist/sw.js", original);
  }
});
test("a move made during activation is saved before the update reloads", async ({
  page,
}) => {
  const original = await readFile("dist/sw.js", "utf8");
  try {
    const game = await seedRound(page);
    await page.getByLabel("Game menu", { exact: true }).click();
    await stageUpdate(page, original, "runset-late-move");
    await page.evaluate(() => {
      const post = ServiceWorker.prototype.postMessage;
      (window as any).__controllerChanged = 0;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        (window as any).__controllerChanged++;
      });
      ServiceWorker.prototype.postMessage = function (
        message: any,
        transfer: any,
      ) {
        if (message?.type !== "SKIP_WAITING")
          return post.call(this, message, transfer);
        const worker = this;
        void navigator.locks.request("runset-game-save", async () => {
          let release!: () => void;
          const held = new Promise<void>((resolve) => (release = resolve));
          (window as any).__releaseUpdate = release;
          document
            .querySelector<HTMLButtonElement>('.rack [data-tile-id="3"]')!
            .click();
          requestAnimationFrame(() => {
            document.querySelector<HTMLButtonElement>(".new-meld")!.click();
            requestAnimationFrame(() => post.call(worker, message, transfer));
          });
          await held;
        });
      };
    });
    let navigations = 0;
    page.on("framenavigated", (frame) => {
      if (frame === page.mainFrame()) navigations++;
    });
    await page
      .getByRole("button", { name: "Save and update", exact: true })
      .click();
    await page.waitForFunction(() => (window as any).__controllerChanged === 1);
    await expect(page.locator(".save-indicator")).toHaveText("Saving…");
    expect(navigations).toBe(0);
    expect(
      await page.evaluate(() =>
        JSON.parse(localStorage.getItem("runset.save.v1")!),
      ),
    ).toEqual(game);
    await Promise.all([
      page.waitForEvent("framenavigated"),
      page.evaluate(() => (window as any).__releaseUpdate()),
    ]);
    await page
      .getByRole("button", { name: "Continue game →", exact: true })
      .click();
    await expect(page.locator('.table [data-tile-id="3"]')).toBeVisible();
    expect(navigations).toBe(1);
  } finally {
    await writeFile("dist/sw.js", original);
  }
});
