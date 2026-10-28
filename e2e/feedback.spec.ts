import { test, expect } from "@playwright/test";
import { landscapePosition } from "./helpers/landscape";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";

for (const locale of ["en", "zh-CN"] as const)
  for (const reduced of [false, true])
    test(`${locale} reduced=${reduced}: latest play is static and only moved tiles land`, async ({
      page,
    }) => {
      const t = locale === "zh-CN" ? translator(messages) : (s: string) => s;
      await page.setViewportSize({ width: 390, height: 844 });
      await page.emulateMedia({
        reducedMotion: reduced ? "reduce" : "no-preference",
      });
      await page.addInitScript(() => {
        (window as any).__tileLandings = [];
        (window as any).__tileLandingDetails = [];
        (window as any).__tileInterrupted = [];
        const original = HTMLElement.prototype.animate;
        HTMLElement.prototype.animate = function (
          ...args: Parameters<typeof original>
        ) {
          if (this.dataset.tileId) {
            (window as any).__tileLandings.push(Number(this.dataset.tileId));
            (window as any).__tileLandingDetails.push({
              frames: args[0],
              options: args[1],
            });
          }
          const animation = original.apply(this, args);
          const cancel = animation.cancel.bind(animation);
          animation.cancel = () => {
            if (this.dataset.tileId && animation.playState === "running")
              (window as any).__tileInterrupted.push(
                Number(this.dataset.tileId),
              );
            cancel();
          };
          return animation;
        };
      });
      await page.goto("/");
      const game = landscapePosition();
      game.lastPlaced = [9, 35, 61];
      await page.evaluate(
        ({ game, locale }) => {
          localStorage.setItem("runset.save.v1", JSON.stringify(game));
          localStorage.setItem("runset.language", locale);
        },
        { game, locale },
      );
      await page.reload();
      await page
        .getByRole("button", { name: t("Continue game →"), exact: true })
        .click();
      await expect(page.locator(".table .tile.recent")).toHaveCount(3);
      expect(await page.evaluate(() => (window as any).__tileLandings)).toEqual(
        [],
      );
      await expect(page.locator('.table [data-tile-id="9"]')).toHaveAttribute(
        "aria-description",
        t("Played in the latest turn."),
      );
      await page.locator('.rack [data-tile-id="3"]').click();
      await expect(page.locator('.rack [data-tile-id="3"]')).toHaveAttribute(
        "aria-pressed",
        "true",
      );
      await page.evaluate(() => {
        (window as any).__tileLandings = [];
        (window as any).__tileInterrupted = [];
      });
      await page.locator(".meld-target").first().click();
      await expect(page.locator('.table [data-tile-id="3"]')).toBeVisible();
      const animations = await page.evaluate(
        () => (window as any).__tileLandings,
      );
      expect(animations).toEqual(reduced ? [] : [3]);
      const landings = await page.evaluate(
        () => (window as any).__tileLandingDetails,
      );
      for (const landing of landings) {
        expect(landing.options.duration).toBeLessThanOrEqual(180);
        const [x, y] = landing.frames[0].translate.split(" ").map(parseFloat);
        expect(Math.hypot(x, y)).toBeLessThanOrEqual(12.02);
        expect(landing.frames[0].opacity).toBeGreaterThanOrEqual(0.7);
      }
      await expect(page.locator(".table .tile.recent")).toHaveCount(3);
      expect(
        await page
          .locator('.table [data-tile-id="9"]')
          .evaluate((el) => getComputedStyle(el).animationIterationCount),
      ).not.toBe("infinite");
      await expect
        .poll(() =>
          page.evaluate(() =>
            JSON.parse(
              localStorage.getItem("runset.save.v1")!,
            ).players[0].rack.includes(3),
          ),
        )
        .toBe(false);
      await expect(page.locator(".save-indicator")).toHaveText(t("Saved"));
      expect(
        await page.evaluate(() => (window as any).__tileInterrupted),
      ).toEqual([]);
      await page.screenshot({
        path: `/tmp/runset-feedback-${locale}-${reduced}.png`,
        animations: "disabled",
      });
      await page
        .getByRole("button", { name: t("Undo move"), exact: true })
        .click();
      await expect(page.locator('.rack [data-tile-id="3"]')).toBeVisible();
      expect(await page.evaluate(() => (window as any).__tileLandings)).toEqual(
        reduced ? [] : [3],
      );
    });

test("sound unlocks on a gesture and responds to game changes, not view or preference changes", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    localStorage.setItem("runset.muted", "true");
    const state = { contexts: 0, notes: 0 };
    (window as any).__sound = state;
    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      value: class {
        state = "suspended";
        currentTime = 0;
        destination = {};
        constructor() {
          state.contexts++;
        }
        resume() {
          this.state = "running";
          return Promise.resolve();
        }
        createGain() {
          return {
            connect() {},
            gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
          };
        }
        createOscillator() {
          return {
            connect() {},
            frequency: { value: 0 },
            type: "sine",
            start() {
              state.notes++;
            },
            stop() {},
          };
        }
      },
    });
  });
  await page.goto("/");
  await page.evaluate(
    (game) => localStorage.setItem("runset.save.v1", JSON.stringify(game)),
    landscapePosition(),
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Continue game →", exact: true })
    .click();
  await page.locator('.rack [data-tile-id="3"]').click();
  expect(await page.evaluate(() => (window as any).__sound.contexts)).toBe(0);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByLabel("Sound effects", { exact: true }).check();
  await page
    .locator(".settings-heading")
    .getByRole("button", { name: "Done", exact: true })
    .click();
  expect(await page.evaluate(() => (window as any).__sound.notes)).toBe(0);
  await page.locator(".meld-target").first().click();
  await expect
    .poll(() => page.evaluate(() => (window as any).__sound.notes))
    .toBe(2);
  await page.getByLabel("Table view", { exact: true }).selectOption("wide");
  await page.keyboard.press("Escape");
  expect(await page.evaluate(() => (window as any).__sound.notes)).toBe(2);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByLabel("Sound effects", { exact: true }).uncheck();
  await page
    .locator(".settings-heading")
    .getByRole("button", { name: "Done", exact: true })
    .click();
  await page.locator('.rack [data-tile-id="12"]').click();
  await page.locator(".new-meld").click();
  expect(await page.evaluate(() => (window as any).__sound.notes)).toBe(2);
});
