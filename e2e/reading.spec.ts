import { test, expect, type Locator, type Page } from "@playwright/test";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
async function hit(locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  expect(
    await locator.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return el.contains(
        document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
      );
    }),
  ).toBe(true);
  await locator.click();
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
}
for (const [device, width, height, theme] of [
  ["phone", 360, 640, "light"],
  ["tablet", 820, 1180, "dark"],
  ["laptop", 1180, 757, "light"],
] as const) {
  for (const locale of ["en", "zh-CN"] as const) {
    test(`${device} ${locale}: comfortable reading preserves play and exposes larger controls`, async ({
      page,
    }) => {
      const t = locale === "zh-CN" ? translator(messages) : (s: string) => s;
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(e.message));
      await page.setViewportSize({ width, height });
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      await page.goto("/");
      await page.getByLabel("语言 / Language").selectOption(locale);
      const open = page.getByRole("button", {
        name: t("Settings"),
        exact: true,
      });
      await hit(open);
      const dialog = page.getByRole("dialog", {
        name: t("Settings"),
        exact: true,
      });
      await expect(
        dialog.getByRole("button", { name: t("Done"), exact: true }).first(),
      ).toBeFocused();
      await dialog
        .getByRole("checkbox", { name: t("Comfortable reading"), exact: true })
        .check();
      await expect(page.locator(".app")).toHaveClass(/comfortable-reading/);
      await hit(
        dialog.getByRole("button", { name: t("Done"), exact: true }).last(),
      );
      await expect(open).toBeFocused();
      expect(
        await page
          .locator(".intro")
          .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
      ).toBeGreaterThanOrEqual(18);
      await noOverflow(page);
      await page.screenshot({
        path: `/tmp/runset-reading-${device}-${locale}-home.png`,
        fullPage: true,
        animations: "disabled",
      });
      // A deterministic saved position keeps timer/bot movement out of view-only assertions.
      await page.evaluate(async () => {
        const { practiceGame } = await import("/src/engine/practice.ts");
        localStorage.setItem("runset.save.v1", JSON.stringify(practiceGame()));
      });
      await page.reload();
      await expect(page.locator(".app")).toHaveClass(/comfortable-reading/);
      await hit(
        page.getByRole("button", { name: new RegExp(t("Continue game →")) }),
      );
      const tile = page.locator('.rack [data-tile-id="9"]');
      await hit(tile);
      await expect(tile).toHaveAttribute("aria-pressed", "true");
      await expect(tile.locator(".tile-check")).toHaveText("✓");
      expect(
        await tile.evaluate((el) => el.getBoundingClientRect().height),
      ).toBeGreaterThanOrEqual(80);
      const save = await page.evaluate(() =>
        localStorage.getItem("runset.save.v1"),
      );
      await hit(open);
      await dialog
        .getByRole("checkbox", { name: t("Comfortable reading"), exact: true })
        .uncheck();
      await dialog
        .getByRole("checkbox", { name: t("Comfortable reading"), exact: true })
        .check();
      await page.keyboard.press("Escape");
      await expect(open).toBeFocused();
      await expect(tile).toHaveAttribute("aria-pressed", "true");
      expect(
        await page.evaluate(() => localStorage.getItem("runset.save.v1")),
      ).toBe(save);
      await hit(
        page.getByRole("button", {
          name: t("Show a possible move"),
          exact: true,
        }),
      );
      await expect(
        page.getByRole("button", { name: t("Place hint"), exact: true }),
      ).toBeVisible();
      await hit(
        page.getByRole("button", { name: t("Dismiss hint"), exact: true }),
      );
      await noOverflow(page);
      await hit(
        page.getByRole("button", {
          name: t("Draw a tile") + " ↓",
          exact: true,
        }),
      );
      // Home cancels pending bot work, leaving the next screen free to inspect.
      await hit(page.getByRole("button", { name: t("Home"), exact: true }));
      await hit(
        page
          .getByRole("button", { name: t("How to play") + " →", exact: true })
          .first(),
      );
      expect(
        await page
          .locator(".guide p")
          .first()
          .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
      ).toBeGreaterThanOrEqual(18);
      await noOverflow(page);
      await hit(page.getByRole("button", { name: t("Home"), exact: true }));
      await hit(
        page.getByRole("button", {
          name: t("Learn to play") + " →",
          exact: true,
        }),
      );
      for (const ids of [
        [9, 35, 61],
        [0, 1, 2],
      ]) {
        for (const id of ids)
          await hit(page.locator(`.rack [data-tile-id="${id}"]`));
        await hit(page.locator(".new-meld"));
      }
      await hit(
        page.getByRole("button", {
          name: t("I see: 30 + 6 = 36 →"),
          exact: true,
        }),
      );
      await hit(
        page.getByRole("button", { name: t("End turn →"), exact: true }),
      );
      await hit(
        page.getByRole("button", {
          name: t("Watch Juniper draw →"),
          exact: true,
        }),
      );
      await hit(
        page.getByRole("button", {
          name: t("Draw a tile") + " ↓",
          exact: true,
        }),
      );
      await hit(page.locator('.rack [data-tile-id="12"]'));
      await hit(page.locator(".new-meld"));
      await expect(page.locator(".meld.invalid")).toHaveAttribute(
        "data-invalid-label",
        t("Needs fixing"),
      );
      await hit(
        page.getByRole("button", { name: t("Reset turn"), exact: true }),
      );
      await expect(
        page.getByRole("heading", {
          name: t("You know the basics"),
          exact: true,
        }),
      ).toBeVisible();
      await hit(page.getByRole("button", { name: t("Jokers"), exact: true }));
      await hit(page.locator('.rack [data-tile-id="4"]'));
      await hit(
        page.getByRole("button", {
          name: t("Add selected tiles to meld 1"),
          exact: true,
        }),
      );
      for (const id of [104, 30, 56])
        await hit(page.locator(`.game [data-tile-id="${id}"]`));
      await hit(page.locator(".new-meld"));
      await expect(
        page.getByRole("heading", {
          name: t("Joker lesson complete"),
          exact: true,
        }),
      ).toBeVisible();
      await hit(
        page.getByRole("button", { name: t("Rearranging"), exact: true }),
      );
      for (const id of [3, 4, 5, 6])
        await hit(page.locator(`.game [data-tile-id="${id}"]`));
      await hit(page.locator(".new-meld"));
      await expect(
        page.getByRole("heading", {
          name: t("Run-splitting lesson complete"),
          exact: true,
        }),
      ).toBeVisible();
      await noOverflow(page);
      await page.screenshot({
        path: `/tmp/runset-reading-${device}-${locale}-lesson.png`,
        fullPage: true,
        animations: "disabled",
      });
      expect(errors).toEqual([]);
    });
  }
}

test("reading settings keep separate preferences and recover keyboard focus", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Settings", exact: true });
  await dialog.getByLabel("Comfortable reading", { exact: true }).check();
  await dialog.getByLabel("Sound effects", { exact: true }).check();
  await dialog
    .getByLabel("Opponent pace", { exact: true })
    .selectOption("2400");
  await dialog.getByLabel("Explain opponent moves", { exact: true }).uncheck();
  await page.keyboard.press("Escape");
  await page.reload();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(
    dialog.getByLabel("Comfortable reading", { exact: true }),
  ).toBeChecked();
  await expect(
    dialog.getByLabel("Sound effects", { exact: true }),
  ).toBeChecked();
  await expect(dialog.getByLabel("Opponent pace", { exact: true })).toHaveValue(
    "2400",
  );
  await expect(
    dialog.getByLabel("Explain opponent moves", { exact: true }),
  ).not.toBeChecked();
  await dialog.getByLabel("Comfortable reading", { exact: true }).uncheck();
  await dialog.getByLabel("Larger touch controls", { exact: true }).check();
  await page.keyboard.press("Escape");
  expect(
    await page.evaluate(() => localStorage.getItem("runset.largeTiles")),
  ).toBe("true");
  expect(
    await page.evaluate(() => localStorage.getItem("runset.reading")),
  ).toBe("false");
  await page.getByRole("button", { name: /New game/ }).click();
  await page.getByRole("button", { name: /Deal the tiles/ }).click();
  await page.getByRole("button", { name: "Home", exact: true }).click();
  await page
    .getByRole("button", { name: "Delete saved game", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete game", exact: true }).click();
  expect(
    await page.evaluate(() => localStorage.getItem("runset.reading")),
  ).toBe("false");
  expect(
    await page.evaluate(() => localStorage.getItem("runset.largeTiles")),
  ).toBe("true");
  expect(await page.evaluate(() => localStorage.getItem("runset.pace"))).toBe(
    "2400",
  );
});

test("settings preserve a timed turn and explain that the clock continues", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const { practiceGame } = await import("/src/engine/practice.ts");
    const s = practiceGame();
    s.turnSeconds = 120;
    s.deadline = Date.now() + 3000;
    localStorage.setItem("runset.save.v1", JSON.stringify(s));
  });
  await page.reload();
  await page.getByRole("button", { name: /Continue game/ }).click();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Settings", exact: true });
  await expect(dialog.getByRole("status")).toContainText(
    "turn timer keeps running",
  );
  await expect
    .poll(() =>
      page.evaluate(
        () => JSON.parse(localStorage.getItem("runset.save.v1")!).turn,
      ),
    )
    .toBe(2);
  await expect(dialog).toBeVisible();
  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("runset.save.v1")!),
  );
  expect(saved.players[0].rack).toHaveLength(15);
  expect(saved.current).toBe(1);
  await page.keyboard.press("Escape");
});
