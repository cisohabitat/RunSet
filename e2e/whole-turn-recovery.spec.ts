import { test, expect } from "@playwright/test";
import { practiceGame } from "../src/engine/practice";
import { replayTurnPractice, turnPracticeKey } from "../src/lib/turnPractice";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
for (const locale of ["en", "zh-CN"] as const) {
  test(`${locale}: whole-turn keyboard play survives unreadable progress and failed writes`, async ({
    page,
  }) => {
    const t = locale === "en" ? (s: string) => s : translator(messages);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({
      reducedMotion: "reduce",
      colorScheme: locale === "en" ? "light" : "dark",
    });
    await page.addInitScript(
      ({ locale, key, game }) => {
        localStorage.setItem("runset.language", locale);
        localStorage.setItem("runset.reading", String(locale === "zh-CN"));
        localStorage.setItem("runset.save.v1", JSON.stringify(game));
        localStorage.setItem(
          key,
          JSON.stringify({
            version: 1,
            mode: "guided",
            showSteps: true,
            actions: [{ type: "botTurn", table: [] }],
          }),
        );
      },
      { locale, key: turnPracticeKey, game: practiceGame() },
    );
    await page.goto("/");
    const saved = await page.evaluate(() =>
      localStorage.getItem("runset.save.v1"),
    );
    await page
      .getByRole("button", { name: new RegExp(t("Learn to play")) })
      .click();
    await page
      .getByRole("button", { name: t("Practise a whole turn"), exact: true })
      .click();
    await expect(
      page.getByRole("status").filter({
        hasText: t(
          "The saved whole-turn practice could not be restored. A fresh practice table is ready; your other games and lessons are unchanged.",
        ),
      }),
    ).toBeVisible();
    const goal = page.locator("#practice-instructions");
    expect(
      await goal.evaluate((el) => {
        const goal = el.getBoundingClientRect(),
          panel = el.closest(".practice-panel")!.getBoundingClientRect();
        return goal.top >= panel.top && goal.bottom <= panel.bottom;
      }),
    ).toBe(true);
    // Fail only the optional practice write. Game remains interactive and does not overwrite its regular save.
    await page.evaluate((key) => {
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, value) {
        if (k === key) throw new DOMException("full", "QuotaExceededError");
        original.call(this, k, value);
      };
    }, turnPracticeKey);
    const first = page.locator('.rack [data-tile-id="9"]');
    await first.focus();
    await page.keyboard.press("Space");
    await expect(first).toHaveAttribute("aria-pressed", "true");
    await page.keyboard.press("n");
    const warning = page.getByRole("status").filter({
      hasText: t(
        "Latest whole-turn practice changes cannot be saved in this browser. Your regular game is unchanged.",
      ),
    });
    await expect(warning).toBeVisible();
    await expect(warning).toBeFocused();
    expect(
      await warning.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return r.top >= 0 && r.bottom <= innerHeight;
      }),
    ).toBe(true);
    await page
      .getByRole("button", { name: t("Check this turn"), exact: true })
      .click();
    const feedback = page.getByRole("status").filter({
      hasText: t(
        "Your turn is not ready. Keep editing or choose Reset. No penalty was applied.",
      ),
    });
    await expect(feedback).toBeFocused();
    expect(
      await feedback.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return r.top >= 0 && r.bottom <= innerHeight;
      }),
    ).toBe(true);
    // Hold deferred focus until a real keyboard press has started on a tile.
    // A background warning must not take that key-up away from the player.
    await page.evaluate(() => {
      const w = window as typeof window & { flushPracticeFocus?: () => number };
      const nativeFrame = window.requestAnimationFrame,
        nativeCancel = window.cancelAnimationFrame,
        pending = new Map<number, FrameRequestCallback>();
      let id = 0;
      window.requestAnimationFrame = (callback) => {
        pending.set(--id, callback);
        return id;
      };
      window.cancelAnimationFrame = (frame) => {
        if (frame < 0) pending.delete(frame);
        else nativeCancel.call(window, frame);
      };
      w.flushPracticeFocus = () => {
        window.requestAnimationFrame = nativeFrame;
        window.cancelAnimationFrame = nativeCancel;
        const count = pending.size;
        for (const callback of pending.values()) callback(performance.now());
        pending.clear();
        delete w.flushPracticeFocus;
        return count;
      };
    });
    await page
      .getByRole("button", { name: t("Reset turn"), exact: true })
      .click();
    await first.focus();
    await page.keyboard.down("Space");
    await page.evaluate(() =>
      (
        window as typeof window & {
          flushPracticeFocus: () => number;
        }
      ).flushPracticeFocus(),
    );
    await expect(first).toBeFocused();
    await page.keyboard.up("Space");
    await expect(first).toHaveAttribute("aria-pressed", "true");
    for (const id of [35, 61]) {
      await page.locator(`.rack [data-tile-id="${id}"]`).focus();
      await page.keyboard.press("Space");
    }
    await page.keyboard.press("n");
    await expect(page.locator(".table .meld .tile")).toHaveCount(3);
    await page.screenshot({
      path: `/tmp/runset-whole-turn-desktop-${locale}.png`,
      fullPage: true,
    });
    await page
      .getByRole("button", { name: t("End turn →"), exact: true })
      .click();
    await expect(
      page.getByRole("heading", {
        name: t("Opening turn complete"),
        exact: true,
      }),
    ).toBeVisible();
    expect(
      await page.evaluate(() => localStorage.getItem("runset.save.v1")),
    ).toBe(saved);
    // The unreadable record was never mistaken for arbitrary game state or overwritten on a failed save.
    expect(
      replayTurnPractice(
        await page.evaluate(
          (key) => JSON.parse(localStorage.getItem(key)!),
          turnPracticeKey,
        ),
      ),
    ).toBeNull();
  });
}
