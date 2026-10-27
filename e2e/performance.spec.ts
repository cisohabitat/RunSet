import { test, expect } from "@playwright/test";
import { stressPosition } from "./helpers/stress";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
import { writeFile, mkdir } from "node:fs/promises";
test.use({ hasTouch: true });
for (const locale of ["en", "zh-CN"] as const)
  for (const width of [390, 1180])
    test(`${locale} ${width}: touch layout and bounded history remain responsive at 4x CPU slowdown`, async ({
      page,
      context,
    }, testInfo) => {
      const t = locale === "en" ? (s: string) => s : translator(messages);
      const game = stressPosition();
      const id = game.players[0].rack[0];
      await page.setViewportSize({ width, height: width === 390 ? 844 : 820 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.addInitScript(
        ({ game, locale }) => {
          localStorage.setItem("runset.save.v1", JSON.stringify(game));
          localStorage.setItem("runset.language", locale);
          localStorage.setItem("runset.muted", "true");
        },
        { game, locale },
      );
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto("/");
      await page
        .getByRole("button", { name: t("Continue game →"), exact: true })
        .tap();
      await expect(page.locator(".table .tile")).toHaveCount(50);
      await expect(page.locator(".rack .tile")).toHaveCount(50);
      const cdp = await context.newCDPSession(page);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      await page.evaluate((undoLabel) => {
        (window as any).__renderSamples = [];
        document.querySelector(".game")!.addEventListener(
          "click",
          (e) => {
            const target = e.target as Element;
            if (
              !target.closest(".new-meld") &&
              target.closest("button")?.getAttribute("aria-label") !== undoLabel
            )
              return;
            const start = performance.now();
            requestAnimationFrame(() =>
              requestAnimationFrame(() =>
                (window as any).__renderSamples.push(performance.now() - start),
              ),
            );
          },
          true,
        );
      }, t("Undo move"));
      for (let n = 0; n < 5; n++) {
        await page.locator(`.rack [data-tile-id="${id}"]`).click();
        await page.locator(".new-meld").tap();
        await expect(
          page.locator(`.table [data-tile-id="${id}"]`),
        ).toBeVisible();
        await page
          .getByRole("button", { name: t("Undo move"), exact: true })
          .tap();
        await expect(page.locator(".rack .tile")).toHaveCount(50);
      }
      await expect
        .poll(() => page.evaluate(() => (window as any).__renderSamples.length))
        .toBe(10);
      const samples: number[] = await page.evaluate(
        () => (window as any).__renderSamples,
      );
      expect(Math.max(...samples)).toBeLessThan(1000);
      await expect
        .poll(() =>
          page.evaluate(
            () =>
              JSON.parse(localStorage.getItem("runset.save.v1")!).players[0]
                .rack,
          ),
        )
        .toEqual(game.players[0].rack);
      const saved = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("runset.save.v1")!),
      );
      expect(saved.history.length).toBeLessThanOrEqual(100);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(errors).toEqual([]);
      await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });
      const report = {
        locale,
        viewport: { width, height: width === 390 ? 844 : 820 },
        browser: page.context().browser()?.version(),
        cpuThrottle: 4,
        coarsePointer: await page.evaluate(
          () => matchMedia("(any-pointer: coarse)").matches,
        ),
        tableTiles: 50,
        rackTiles: 50,
        initialUndoSnapshots: 100,
        metric:
          "Click capture to second requestAnimationFrame; browser smoke measurement, not physical-device latency.",
        samplesMs: samples,
        maxMs: Math.max(...samples),
      };
      await mkdir("/tmp/runset-quality-performance", { recursive: true });
      await writeFile(
        `/tmp/runset-quality-performance/${locale}-${width}.json`,
        JSON.stringify(report, null, 2),
      );
      await testInfo.attach("render-timings", {
        body: JSON.stringify(report),
        contentType: "application/json",
      });
    });
