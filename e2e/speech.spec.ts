import { expect, test, type Locator } from "@playwright/test";
import { mockSpeech } from "./helpers/speech";
import { practiceGame } from "../src/engine/practice";

async function hit(control: Locator) {
  await control.scrollIntoViewIfNeeded();
  expect(
    await control.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return (
        r.height >= 44 &&
        r.width >= 44 &&
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
  await control.click();
}
for (const [device, width, height, reading] of [
  ["phone", 375, 667, false],
  ["tablet", 820, 1180, true],
  ["desktop", 1440, 900, false],
] as const) {
  test(`${device}: Mandarin lessons read only on request and stop when instructions change`, async ({
    page,
  }) => {
    await mockSpeech(page);
    await page.setViewportSize({ width, height });
    await page.emulateMedia({
      colorScheme: device === "tablet" ? "dark" : "light",
    });
    await page.addInitScript((reading) => {
      localStorage.setItem("runset.language", "zh-CN");
      localStorage.setItem("runset.reading", String(reading));
    }, reading);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto("/");
    await page.getByRole("button", { name: /学习玩法/ }).click();
    await expect(page.locator("#practice-instructions")).toBeVisible();
    expect(await page.evaluate(() => (window as any).__speech.spoken)).toEqual(
      [],
    );
    await hit(page.getByRole("button", { name: "听一听", exact: true }));
    const spoken = await page.evaluate(() => (window as any).__speech.spoken);
    expect(spoken).toHaveLength(1);
    expect(spoken[0].lang).toBe("zh-CN");
    expect(spoken[0].text).toContain(
      await page
        .locator("#practice-instructions")
        .innerText()
        .then((s) => s.replaceAll("→", "，")),
    );
    expect(spoken[0].rate).toBeLessThan(1);
    expect(spoken[0].rate).toBeGreaterThanOrEqual(0.9);
    expect(spoken[0].pitch).toBeGreaterThan(1);
    expect(spoken[0].pitch).toBeLessThanOrEqual(1.12);
    await page.screenshot({
      path: `/tmp/runset-audio-${device}-playing.png`,
      fullPage: true,
    });
    await hit(page.getByRole("button", { name: "再听一次" }));
    expect(
      await page.evaluate(() => (window as any).__speech.spoken.length),
    ).toBe(2);
    await hit(page.getByRole("button", { name: "停止朗读" }));
    await expect(page.getByRole("button", { name: "再听一次" })).toBeFocused();
    expect(
      await page.evaluate(() => (window as any).__speech.active),
    ).toBeNull();
    await hit(page.getByRole("button", { name: "再听一次" }));
    for (const id of [9, 35, 61])
      await page.locator(`.rack [data-tile-id="${id}"]`).click();
    await page.locator(".new-meld").click();
    await expect(
      page.getByRole("button", { name: "听一听", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(() => (window as any).__speech.active),
    ).toBeNull();
    // A late completion event from canceled speech cannot change new playback.
    await page.evaluate(
      () => ((window as any).__speech.old = (window as any).__speech.last),
    );
    await hit(page.getByRole("button", { name: "听一听", exact: true }));
    await page.evaluate(() => (window as any).__speech.old.onend());
    await expect(page.getByRole("button", { name: "停止朗读" })).toBeVisible();
    await page.getByRole("button", { name: "万能牌", exact: true }).click();
    expect(
      await page.evaluate(() => (window as any).__speech.active),
    ).toBeNull();
    await hit(page.getByRole("button", { name: "听一听", exact: true }));
    await page.getByLabel("语言 / Language").selectOption("en");
    expect(
      await page.evaluate(() => (window as any).__speech.active),
    ).toBeNull();
    await hit(page.getByRole("button", { name: "Listen", exact: true }));
    expect(
      await page.evaluate(() => (window as any).__speech.spoken.at(-1).lang),
    ).toBe("en-US");
    if (device === "desktop") {
      await page.evaluate(() => {
        Object.defineProperty(document, "hidden", {
          configurable: true,
          value: true,
        });
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await expect
        .poll(() => page.evaluate(() => (window as any).__speech.active))
        .toBeNull();
      await page.evaluate(() => {
        Object.defineProperty(document, "hidden", {
          configurable: true,
          value: false,
        });
      });
      await page.getByRole("button", { name: "Replay audio" }).click();
    }
    await page.getByRole("button", { name: "Exit practice" }).click();
    expect(
      await page.evaluate(() => (window as any).__speech.active),
    ).toBeNull();
    expect(
      await page.evaluate(() => localStorage.getItem("runset.save.v1")),
    ).toBeNull();
    expect(errors).toEqual([]);
    await page.screenshot({
      path: `/tmp/runset-audio-${device}.png`,
      fullPage: true,
    });
  });
}

test("delayed voices, missing Mandarin and synthesis failure keep a usable lesson", async ({
  page,
}) => {
  await mockSpeech(page, { voices: [] });
  await page.goto("/");
  await page.getByLabel("语言 / Language").selectOption("zh-CN");
  await page
    .locator(".home")
    .getByRole("button", { name: /学习玩法/ })
    .click();
  const listen = page.getByRole("button", { name: "听一听", exact: true });
  await listen.click();
  await expect(page.locator(".audio-note")).toContainText("语音尚未准备好");
  await page.evaluate(
    () =>
      ((window as any).__speech.voices = [
        { lang: "zh-HK", localService: true },
        { lang: "en-US", localService: true },
      ]),
  );
  await listen.click();
  await expect(page.locator(".audio-note")).toContainText("设备没有当前语言");
  expect(await page.evaluate(() => (window as any).__speech.spoken)).toEqual(
    [],
  );
  await page.evaluate(
    () =>
      ((window as any).__speech.voices = [
        { lang: "zh-CN", localService: true },
      ]),
  );
  await listen.click();
  await page.evaluate(() => (window as any).__speech.fail());
  await expect(page.locator(".audio-note")).toContainText("朗读暂时无法播放");
  await page.getByRole("button", { name: "再听一次" }).click();
  await page.evaluate(() => (window as any).__speech.finish());
  await expect(page.getByRole("button", { name: "停止朗读" })).toHaveCount(0);
  await expect(page.locator("#practice-instructions")).not.toBeEmpty();
});

test("unsupported browser keeps instructions playable without audio", async ({
  page,
}) => {
  await mockSpeech(page, { unsupported: true });
  await page.goto("/");
  await page.getByRole("button", { name: /Learn to play/ }).click();
  await expect(page.locator(".audio-note")).toContainText(
    "unavailable in this browser",
  );
  for (const id of [9, 35, 61])
    await page.locator(`.rack [data-tile-id="${id}"]`).click();
  await page.locator(".new-meld").click();
  await expect(page.getByRole("heading", { name: "Make a run" })).toBeVisible();
});

test("reminders work in expanded view without changing the game and stop on close", async ({
  page,
}) => {
  await mockSpeech(page);
  await page.addInitScript((game) => {
    localStorage.setItem("runset.save.v1", JSON.stringify(game));
    localStorage.setItem("runset.language", "zh-CN");
    localStorage.setItem("runset.tableExpanded", "true");
  }, practiceGame());
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto("/");
  await page.getByRole("button", { name: /继续游戏/ }).click();
  const snapshot = await page.evaluate(() =>
    localStorage.getItem("runset.save.v1"),
  );
  await page.locator(".more-actions > summary").click();
  await hit(page.getByRole("button", { name: "听一听提示" }));
  expect(
    await page.locator(".more-actions > div").evaluate((el) => {
      const r = el.getBoundingClientRect();
      return (
        r.left >= 0 &&
        r.right <= innerWidth &&
        r.top >= 0 &&
        r.bottom <= innerHeight
      );
    }),
  ).toBe(true);
  expect(
    await page.evaluate(() => (window as any).__speech.spoken[0].lang),
  ).toBe("zh-CN");
  expect(
    await page.evaluate(() => (window as any).__speech.spoken[0].text),
  ).toBe(
    (await page.locator(".audio-transcript").innerText()).replaceAll("→", "，"),
  );
  expect(
    await page.evaluate(() => localStorage.getItem("runset.save.v1")),
  ).toBe(snapshot);
  await page.locator(".more-actions > summary").click();
  await expect
    .poll(() => page.evaluate(() => (window as any).__speech.active))
    .toBeNull();
  await page.locator(".more-actions > summary").click();
  await hit(page.getByRole("button", { name: "再听一次" }));
  await page.locator('.rack [data-tile-id="9"]').click();
  await expect
    .poll(() => page.evaluate(() => (window as any).__speech.active))
    .toBeNull();
  await page.screenshot({ path: "/tmp/runset-audio-reminder.png" });
});
