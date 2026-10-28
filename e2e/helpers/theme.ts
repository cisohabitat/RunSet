import {
  expect,
  type Page,
  type BrowserContext,
  type TestInfo,
} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { landscapePosition } from "./landscape";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";
export async function verifyTheme(
  page: Page,
  context: BrowserContext,
  info: TestInfo,
  locale: "en" | "zh-CN",
  offline: boolean,
) {
  const t = locale === "en" ? (s: string) => s : translator(messages),
    game = landscapePosition(),
    now = Date.now();
  game.deadline = now + 120000;
  game.coach = false;
  await page.clock.install({ time: now });
  await page.emulateMedia({ reducedMotion: "reduce", colorScheme: "dark" });
  await page.addInitScript(
    ({ game, locale }) => {
      if (sessionStorage.getItem("theme-seed")) return;
      sessionStorage.setItem("theme-seed", "1");
      localStorage.setItem("runset.save.v1", JSON.stringify(game));
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.theme", "constructor");
      localStorage.setItem("runset.reading", String(locale === "zh-CN"));
    },
    { game, locale },
  );
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const b = (s: string) =>
      page.getByRole("button", { name: t(s), exact: true }),
    root = page.locator("html"),
    save = () => page.evaluate(() => localStorage.getItem("runset.save.v1"));
  await page.goto("/");
  await expect(root).toHaveAttribute("data-theme", "dark");
  if (offline) {
    await expect(
      page.getByRole("status").filter({ hasText: t("Ready offline") }),
    ).toBeVisible();
    await context.setOffline(true);
  }
  await b("Continue game →").click();
  const tile = page.locator(".rack .tile").first();
  await tile.click();
  await b("Add selected tiles to meld 1").click();
  await tile.click();
  const before = await save(),
    id = await tile.getAttribute("data-tile-id");
  await b("Settings").click();
  const dialog = page.getByRole("dialog", { name: t("Settings"), exact: true }),
    choice = dialog.getByRole("combobox", {
      name: t("Display theme"),
      exact: true,
    });
  await expect(choice).toHaveValue("system");
  await choice.selectOption("light");
  await expect(root).toHaveAttribute("data-theme", "light");
  await expect
    .poll(() => root.evaluate((el) => getComputedStyle(el).colorScheme))
    .toBe("light");
  await expect
    .poll(() =>
      root.evaluate((el) =>
        getComputedStyle(el).getPropertyValue("--paper").trim(),
      ),
    )
    .toBe("#f7f6ef");
  await page.emulateMedia({ colorScheme: "light" });
  await choice.selectOption("dark");
  await expect(root).toHaveAttribute("data-theme", "dark");
  const high = dialog.getByRole("checkbox", {
    name: t("Higher contrast"),
    exact: true,
  });
  await high.check();
  await expect
    .poll(() =>
      root.evaluate((el) =>
        getComputedStyle(el).getPropertyValue("--paper").trim(),
      ),
    )
    .toBe("#08140e");
  await choice.selectOption("light");
  await expect
    .poll(() =>
      root.evaluate((el) =>
        getComputedStyle(el).getPropertyValue("--paper").trim(),
      ),
    )
    .toBe("#fff");
  await high.uncheck();
  await choice.selectOption("system");
  await expect(root).toHaveAttribute("data-theme", "light");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(root).toHaveAttribute("data-theme", "dark");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(root).toHaveAttribute("data-theme", "light");
  await choice.selectOption("dark");
  await choice.scrollIntoViewIfNeeded();
  expect(
    await choice.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return (
        r.width >= 44 && r.height >= 44 && r.left >= 0 && r.right <= innerWidth
      );
    }),
  ).toBe(true);
  expect(
    (await new AxeBuilder({ page }).include(".settings-dialog").analyze())
      .violations,
  ).toEqual([]);
  await page.screenshot({
    path: `/tmp/runset-theme-${info.project.name || "chromium"}-${locale}.png`,
  });
  await dialog
    .getByRole("button", { name: t("Done"), exact: true })
    .first()
    .click();
  await expect(b("Settings")).toBeFocused();
  await expect(page.locator(`.rack [data-tile-id="${id}"]`)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(await save()).toBe(before);
  await page.reload();
  await expect(root).toHaveAttribute("data-theme", "dark");
  expect(await save()).toBe(before);
  // A denied optional write is explained and cannot prevent a display change.
  await page.evaluate(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (key === "runset.theme") throw Error("denied");
      return original.call(this, key, value);
    };
  });
  await b("Settings").click();
  await choice.selectOption("light");
  await expect(root).toHaveAttribute("data-theme", "light");
  await expect(dialog.getByRole("status")).toContainText(
    t(
      "This display choice could not be saved. It still applies for this visit.",
    ),
  );
  expect(await save()).toBe(before);
  await dialog
    .getByRole("button", { name: t("Done"), exact: true })
    .first()
    .click();
  await b("Delete saved game").click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: t("Delete game"), exact: true })
    .click();
  await expect.poll(save).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem("runset.theme"))).toBe(
    "dark",
  );
  expect(errors).toEqual([]);
}
