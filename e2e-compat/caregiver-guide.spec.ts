import { test, expect, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { landscapePosition } from "../e2e/helpers/landscape";
import { translator } from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
const chinese = translator(messages);
async function activate(control: Locator) {
  await control.scrollIntoViewIfNeeded();
  expect(
    await control.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return el.contains(
        document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
      );
    }),
  ).toBe(true);
  await control.click();
}
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: first offline setup guide preserves play through language and display choices`, async ({
    page,
    context,
  }, info) => {
    const initialT = locale === "en" ? (s: string) => s : chinese;
    const nextLocale = locale === "en" ? "zh-CN" : "en";
    const t = nextLocale === "en" ? (s: string) => s : chinese;
    if (info.project.name === "webkit-phone")
      await page.setViewportSize({ width: 320, height: 640 });
    await page.emulateMedia({
      colorScheme: locale === "en" ? "light" : "dark",
      reducedMotion: "reduce",
    });
    const game = landscapePosition();
    delete game.match;
    game.coach = false;
    if (locale === "zh-CN") {
      delete game.turnSeconds;
      delete game.deadline;
    }
    await page.clock.install();
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.addInitScript(
      ({ game, locale }) => {
        if (sessionStorage.getItem("guide-seeded")) return;
        sessionStorage.setItem("guide-seeded", "true");
        localStorage.setItem("runset.save.v1", JSON.stringify(game));
        localStorage.setItem("runset.language", locale);
        localStorage.setItem("runset.reading", String(locale === "zh-CN"));
        localStorage.setItem("runset.muted", "true");
      },
      { game, locale },
    );
    await page.goto("/");
    await expect(
      page.getByRole("status").filter({ hasText: initialT("Ready offline") }),
    ).toBeVisible();
    await context.setOffline(true);
    await activate(
      page.getByRole("button", {
        name: initialT("Continue game →"),
        exact: true,
      }),
    );
    await activate(page.locator('.rack [data-tile-id="3"]'));
    const before = await page.evaluate(() =>
      localStorage.getItem("runset.save.v1"),
    );
    const opener = page.getByRole("button", {
      name: initialT("Settings"),
      exact: true,
    });
    await activate(opener);
    const dialog = page.locator(".settings-dialog");
    const guide = dialog.locator(".caregiver-guide");
    await expect(guide).not.toHaveAttribute("open", "");
    await activate(guide.locator("summary"));
    await expect(guide.locator("li")).toHaveCount(5);
    const language = guide.getByLabel("语言 / Language");
    await language.selectOption(nextLocale);
    await expect(guide.locator("summary")).toHaveText(t("Set up together"));
    await expect(language).toHaveValue(nextLocale);
    await expect(guide.locator("li").last()).toHaveText(
      t(
        "Try Learn to play together first. New games default to one Easy opponent, no timer and guidance on.",
      ),
    );
    expect(
      (await new AxeBuilder({ page }).include(".settings-dialog").analyze())
        .violations,
    ).toEqual([]);
    const choose = guide.getByRole("button", {
      name: t("Choose display settings"),
      exact: true,
    });
    await choose.scrollIntoViewIfNeeded();
    expect((await choose.boundingBox())!.height).toBeGreaterThanOrEqual(48);
    await page.screenshot({
      path: `/tmp/runset-caregiver-${info.project.name}-${locale}.png`,
      fullPage: true,
    });
    await activate(choose);
    const reading = dialog.getByRole("checkbox", {
      name: t("Comfortable reading"),
      exact: true,
    });
    await expect(reading).toBeFocused();
    await expect(guide).not.toHaveAttribute("open", "");
    await reading.setChecked(locale === "en");
    await dialog
      .getByRole("checkbox", { name: t("Higher contrast"), exact: true })
      .check();
    await dialog
      .getByRole("checkbox", { name: t("Simple home screen"), exact: true })
      .check();
    await dialog
      .getByLabel(t("Opponent pace"), { exact: true })
      .selectOption("5000");
    await expect(
      dialog.getByRole("checkbox", { name: t("Sound effects"), exact: true }),
    ).not.toBeChecked();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(
      await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
    if (game.deadline)
      await expect(dialog).toContainText(
        t("The turn timer keeps running while settings are open."),
      );
    await page.keyboard.press("Escape");
    await expect(
      page.getByRole("button", { name: t("Settings"), exact: true }),
    ).toBeFocused();
    await expect(page.locator('.rack [data-tile-id="3"]')).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      await page.evaluate(() => localStorage.getItem("runset.save.v1")),
    ).toBe(before);
    await page.reload();
    await expect(page.locator(".simple-home")).toBeVisible();
    await activate(
      page.getByRole("button", { name: t("Settings"), exact: true }),
    );
    await expect(guide.locator("summary")).toHaveText(t("Set up together"));
    await expect(reading).toBeChecked({ checked: locale === "en" });
    await expect(
      dialog.getByRole("checkbox", { name: t("Higher contrast"), exact: true }),
    ).toBeChecked();
    await expect(
      dialog.getByLabel(t("Opponent pace"), { exact: true }),
    ).toHaveValue("5000");
    await page.keyboard.press("Escape");
    expect(
      await page.evaluate(() => localStorage.getItem("runset.save.v1")),
    ).toBe(before);
    expect(errors).toEqual([]);
  });
