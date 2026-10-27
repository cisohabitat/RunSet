import { test, expect } from "@playwright/test";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
// Network-failure cases must reach the route rather than a service-worker cache.
test.use({serviceWorkers:"block"});
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: recordings play without device speech and stop on source, locale and screen changes`, async ({
    page,
  }) => {
    const t = locale === "en" ? (s: string) => s : translator(messages);
    await page.setViewportSize({ width: 375, height: 667 });
    await page.emulateMedia({
      colorScheme: locale === "en" ? "light" : "dark",
    });
    await page.addInitScript((locale) => {
      localStorage.setItem("runset.language", locale);
      Object.defineProperty(window, "speechSynthesis", {
        value: undefined,
        configurable: true,
      });
      const Native = window.Audio;
      (window as any).__recordings = [];
      (window as any).Audio = function (src: string) {
        const audio = new Native(src);
        (window as any).__recordings.push(audio);
        return audio;
      };
    }, locale);
    await page.goto("/");
    await page
      .getByRole("button", { name: t("Learn to play "), exact: false })
      .click();
    await expect(
      page.getByLabel(t("Reading voice"), { exact: true }),
    ).toHaveValue("recorded");
    await page.getByRole("button", { name: t("Listen"), exact: true }).click();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const a = (window as any).__recordings.at(-1);
          return a && !a.paused && a.currentTime > 0;
        }),
      )
      .toBe(true);
    expect(
      await page.evaluate(
        () => new URL((window as any).__recordings.at(-1).src).pathname,
      ),
    ).toBe(`/audio/lesson-0-${locale}.mp3`);
    await page
      .getByRole("button", { name: t("Stop audio"), exact: true })
      .click();
    expect(
      await page.evaluate(() =>
        (window as any).__recordings.every((a: HTMLAudioElement) => a.paused),
      ),
    ).toBe(true);
    await page.screenshot({
      path: `/tmp/runset-narration-${locale}.png`,
      fullPage: true,
    });
    await page
      .getByRole("button", { name: t("Replay audio"), exact: true })
      .click();
    await page
      .getByLabel(t("Reading voice"), { exact: true })
      .selectOption("device");
    await expect(
      page.getByText(
        t(
          "Read aloud is unavailable in this browser. The instructions are still available as text.",
        ),
      ),
    ).toBeVisible();
    expect(
      await page.evaluate(() =>
        (window as any).__recordings.every((a: HTMLAudioElement) => a.paused),
      ),
    ).toBe(true);
    await page
      .getByLabel(t("Reading voice"), { exact: true })
      .selectOption("recorded");
    await page.getByRole("button", { name: t("Listen"), exact: true }).click();
    await page
      .getByLabel("语言 / Language")
      .selectOption(locale === "en" ? "zh-CN" : "en");
    await expect
      .poll(() =>
        page.evaluate(() =>
          (window as any).__recordings.every((a: HTMLAudioElement) => a.paused),
        ),
      )
      .toBe(true);
    const other = locale === "en" ? translator(messages) : (s: string) => s;
    await page
      .getByRole("button", { name: other("Listen"), exact: true })
      .click();
    await page
      .getByRole("button", { name: other("Home"), exact: true })
      .click();
    expect(
      await page.evaluate(() =>
        (window as any).__recordings.every((a: HTMLAudioElement) => a.paused),
      ),
    ).toBe(true);
  });
test("failed recording offers readable fallback and the device choice remains usable", async ({
  page,
}) => {
  await page.route("**/audio/**", (route) => route.abort());
  await page.goto("/");
  await page
    .getByRole("button", { name: "Learn to play", exact: false })
    .click();
  await page.getByRole("button", { name: "Listen", exact: true }).click();
  await expect(
    page.getByText(
      "Audio could not play. Choose Device voice or read the instructions.",
    ),
  ).toBeVisible({ timeout: 15000 });
  await page
    .getByLabel("Reading voice", { exact: true })
    .selectOption("device");
  await expect(page.getByLabel("Reading voice", { exact: true })).toHaveValue(
    "device",
  );
});

test("a stalled audio startup times out and remains cancellable", async ({
  page,
}) => {
  await page.clock.install();
  await page.addInitScript(() => {
    const Native = Audio;
    (window as any).__stalled = [];
    (window as any).Audio = function () {
      const a = new Native();
      a.play = () => new Promise(() => {});
      (window as any).__stalled.push(a);
      return a;
    };
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Learn to play", exact: false })
    .click();
  await page.getByRole("button", { name: "Listen", exact: true }).click();
  await page.clock.fastForward(10001);
  await expect(
    page.getByText(
      "Audio could not play. Choose Device voice or read the instructions.",
      { exact: true },
    ),
  ).toBeVisible();
  await page.getByRole("button", { name: "Replay audio", exact: true }).click();
  await page.getByRole("button", { name: "Stop audio", exact: true }).click();
  await page.clock.fastForward(10001);
  await expect(
    page.getByText(
      "Audio could not play. Choose Device voice or read the instructions.",
      { exact: true },
    ),
  ).toHaveCount(0);
});
