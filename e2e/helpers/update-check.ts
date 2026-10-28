import {
  expect,
  type Page,
  type BrowserContext,
  type TestInfo,
  type Locator,
} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { landscapePosition } from "./landscape";
import { reducer } from "../../src/engine/game";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";
export async function verifyUpdateCheck(
  page: Page,
  context: BrowserContext,
  info: TestInfo,
  locale: "en" | "zh-CN",
) {
  const t = locale === "en" ? (s: string) => s : translator(messages),
    original = landscapePosition();
  original.coach = false;
  original.deadline = Date.now() + 120000;
  const game = reducer(original, { type: "move", ids: [3, 4], target: "new" }),
    raw = JSON.stringify(game);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({
    reducedMotion: "reduce",
    colorScheme: locale === "en" ? "light" : "dark",
  });
  await page.addInitScript(
    ({ raw, locale }) => {
      if (sessionStorage.getItem("update-check-seed")) return;
      sessionStorage.setItem("update-check-seed", "1");
      localStorage.setItem("runset.save.v1", raw);
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.reading", String(locale === "zh-CN"));
      localStorage.setItem("runset.muted", "true");
      localStorage.setItem("runset.tableExpanded", "false");
      localStorage.setItem("runset.tableOrder.v1", "kind");
      localStorage.setItem(
        "runset.roundHistory.v1",
        JSON.stringify({ version: 1, rounds: [] }),
      );
    },
    { raw, locale },
  );
  const b = (s: string) =>
    page.getByRole("button", { name: t(s), exact: true });
  const snapshot = () =>
    page.evaluate(() =>
      Object.fromEntries(
        Object.keys(localStorage)
          .filter((k) => k.startsWith("runset."))
          .map((k) => [k, localStorage.getItem(k)]),
      ),
    );
  const activate = async (el: Locator) => {
    await el.scrollIntoViewIfNeeded();
    expect(
      await el.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return (
          r.width >= 48 &&
          r.height >= 48 &&
          r.top >= 0 &&
          r.bottom <= innerHeight &&
          r.left >= 0 &&
          r.right <= innerWidth &&
          el.contains(
            document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
          )
        );
      }),
    ).toBe(true);
    if (info.project.name === "firefox-desktop") await el.click();
    else await el.tap();
  };
  await page.goto("/");
  await expect(
    page.getByRole("status").filter({ hasText: t("Ready offline") }),
  ).toBeVisible();
  const before = await snapshot();
  let navigations = 0;
  page.on("framenavigated", (f) => {
    if (f === page.mainFrame()) navigations++;
  });
  await page.evaluate(() => {
    const native = ServiceWorkerRegistration.prototype.update,
      post = ServiceWorker.prototype.postMessage;
    (window as any).__checkCalls = 0;
    (window as any).__activations = 0;
    (window as any).__nativeUpdate = native;
    ServiceWorkerRegistration.prototype.update = function () {
      (window as any).__checkCalls++;
      return native.call(this);
    };
    ServiceWorker.prototype.postMessage = function (
      message: any,
      transfer: any,
    ) {
      if (message?.type === "SKIP_WAITING") (window as any).__activations++;
      return post.call(this, message, transfer);
    };
  });
  await activate(b("Check for updates"));
  await expect(
    page.getByRole("status").filter({ hasText: t("No new version found.") }),
  ).toBeVisible();
  expect(await page.evaluate(() => (window as any).__checkCalls)).toBe(1);
  expect(await page.evaluate(() => (window as any).__activations)).toBe(0);
  expect(navigations).toBe(0);
  expect(await snapshot()).toEqual(before);
  await page.evaluate(() => {
    ServiceWorkerRegistration.prototype.update = () =>
      Promise.reject(new Error("check fixture"));
  });
  await activate(b("Check for updates"));
  await expect(
    page.getByRole("status").filter({
      hasText: t(
        "The update check could not finish. Keep playing and try again.",
      ),
    }),
  ).toBeVisible();
  expect(await snapshot()).toEqual(before);
  expect(navigations).toBe(0);
  await page.evaluate(() => {
    ServiceWorkerRegistration.prototype.update = function () {
      return new Promise((resolve) => {
        (window as any).__finishCheck = () => resolve(this);
      });
    };
  });
  await activate(b("Check for updates"));
  await expect(b("Checking for updates…")).toBeDisabled();
  await page.evaluate(() => {
    (window as any).__finishOldCheck = (window as any).__finishCheck;
  });
  await b("Continue game →").click();
  await expect(page.locator('.table [data-tile-id="3"]')).toBeVisible();
  await page.evaluate(() => {
    const finish = (window as any).__finishOldCheck;
    ServiceWorkerRegistration.prototype.update = (window as any).__nativeUpdate;
    finish();
  });
  await page.getByLabel(t("Game menu"), { exact: true }).click();
  await expect(b("Check for updates")).toBeEnabled();
  await expect(
    page.getByText(t("No new version found."), { exact: true }),
  ).toHaveCount(0);
  expect(await snapshot()).toEqual(before);
  expect(navigations).toBe(0);
  await context.setOffline(true);
  await activate(b("Check for updates"));
  await expect(
    page.getByRole("status").filter({
      hasText: t("Connect to check for updates. Your current game stays open."),
    }),
  ).toBeVisible();
  expect(await snapshot()).toEqual(before);
  expect(
    (await new AxeBuilder({ page }).include(".offline-tools").analyze())
      .violations,
  ).toEqual([]);
  const message = page
    .getByRole("status")
    .filter({
      hasText: t("Connect to check for updates. Your current game stays open."),
    });
  await message.scrollIntoViewIfNeeded();
  expect(
    await message.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return (
        r.top >= 0 &&
        r.bottom <= innerHeight &&
        r.left >= 0 &&
        r.right <= innerWidth &&
        parseFloat(getComputedStyle(el).fontSize) >= 16
      );
    }),
  ).toBe(true);
  await page.screenshot({
    path: `/tmp/runset-update-check-${info.project.name || "chromium"}-${locale}.png`,
  });
  await page.reload();
  await b("Continue game →").click();
  await expect(page.locator('.table [data-tile-id="3"]')).toBeVisible();
  expect(await snapshot()).toEqual(before);
  await b("Undo move").click();
  await expect
    .poll(async () =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem("runset.save.v1")!).table,
      ),
    )
    .toEqual(original.table);
  const restored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("runset.save.v1")!),
  );
  expect(restored.deadline).toBe(game.deadline);
  expect(restored.players[0].rack).toEqual(original.players[0].rack);
  expect(errors).toEqual([]);
}
