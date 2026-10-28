import {
  expect,
  type Page,
  type BrowserContext,
  type TestInfo,
  type Locator,
} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { landscapePosition } from "./landscape";
import {
  decodeRoundHistory,
  type RoundRecord,
} from "../../src/lib/roundHistory";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";
export async function verifyHistoryBrowsing(
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
  const rounds: RoundRecord[] = [
      {
        id: "mixed",
        at: now - 3000,
        round: 1,
        winner: 0,
        players: [
          { name: "constructor", bot: null, score: 30 },
          { name: "Pass", bot: "easy", score: -10 },
          { name: "red 7", bot: "hard", score: -20 },
        ],
      },
      {
        id: "normal",
        at: now - 2000,
        round: 2,
        winner: 1,
        players: [
          { name: "你", bot: null, score: -5 },
          { name: "电脑阿明", bot: "normal", score: 5 },
        ],
      },
      {
        id: "hard",
        at: now - 1000,
        round: 3,
        winner: 0,
        players: [
          { name: "You", bot: null, score: 12 },
          { name: "电脑小兰", bot: "hard", score: -4 },
          { name: "电脑老陈", bot: "hard", score: -8 },
        ],
      },
    ],
    raw = JSON.stringify({ version: 1, rounds });
  expect(decodeRoundHistory(raw)).toEqual(rounds);
  await page.emulateMedia({
    reducedMotion: "reduce",
    colorScheme: locale === "en" ? "light" : "dark",
  });
  await page.addInitScript(
    ({ game, locale, raw }) => {
      if (sessionStorage.getItem("history-browsing-seed")) return;
      sessionStorage.setItem("history-browsing-seed", "1");
      localStorage.setItem("runset.save.v1", JSON.stringify(game));
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.reading", String(locale === "zh-CN"));
      localStorage.setItem("runset.simpleHome", String(locale === "zh-CN"));
      localStorage.setItem("runset.roundHistory.v1", raw);
    },
    { game, locale, raw },
  );
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const b = (s: string) =>
      page.getByRole("button", { name: t(s), exact: true }),
    snapshot = () =>
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
          r.width >= 44 &&
          r.height >= 44 &&
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
  if (offline) {
    await expect(
      page.getByRole("status").filter({ hasText: t("Ready offline") }),
    ).toBeVisible();
    await context.setOffline(true);
  }
  if (locale === "zh-CN") {
    await expect(page.locator(".resume-context")).toBeVisible();
    await activate(page.locator(".simple-options > summary"));
  }
  const before = await snapshot();
  await activate(b("Round history"));
  // Wider fallback glyph metrics must not strand the marker or wrap the footer.
  await page.addStyleTag({
    content:
      ".round-history { font-family: Arial, sans-serif; letter-spacing: .3px; }",
  });
  const dialog = page.getByRole("dialog", {
      name: t("Round history"),
      exact: true,
    }),
    rows = dialog.locator(".round-records > li"),
    filter = dialog.getByRole("combobox", {
      name: t("Opponent difficulty"),
      exact: true,
    }),
    counts = dialog.locator(".history-counts");
  await expect(rows).toHaveCount(3);
  await expect(filter).toHaveValue("all");
  await expect(counts).toHaveText(
    `${t("Shown rounds")}: 3 · ${t("Player wins")}: 2`,
  );
  await expect(rows.locator("details[open]")).toHaveCount(0);
  await filter.selectOption("easy");
  await expect(rows).toHaveCount(1);
  await expect(counts).toHaveText(
    `${t("Shown rounds")}: 1 · ${t("Player wins")}: 1`,
  );
  expect(
    await rows
      .locator("summary")
      .evaluate((el) => el.getBoundingClientRect().height),
  ).toBeLessThanOrEqual(80);
  await activate(rows.locator("summary"));
  await expect(rows.locator("details")).toHaveAttribute("open", "");
  await expect(
    rows.getByRole("list", { name: t("Round scores") }),
  ).toBeVisible();
  for (const name of ["constructor", "Pass", "red 7"])
    await expect(rows).toContainText(name);
  await expect(rows).toContainText("+30");
  await expect(rows).toContainText("-10");
  await expect(rows).toContainText("-20");
  await filter.selectOption("hard");
  await expect(rows).toHaveCount(2);
  await expect(counts).toHaveText(
    `${t("Shown rounds")}: 2 · ${t("Player wins")}: 2`,
  );
  await expect(rows.first()).toContainText("You");
  await filter.selectOption("normal");
  await expect(rows).toHaveCount(1);
  await expect(counts).toHaveText(
    `${t("Shown rounds")}: 1 · ${t("Player wins")}: 0`,
  );
  await expect(rows).toContainText("电脑阿明");
  await filter.selectOption("hard");
  await expect(rows).toHaveCount(2);
  await activate(rows.first().locator("summary"));
  expect(
    (await new AxeBuilder({ page }).include(".round-history").analyze())
      .violations,
  ).toEqual([]);
  const footerHeight = await dialog
    .locator(".dialog-actions")
    .evaluate((el) => el.getBoundingClientRect().height);
  expect(footerHeight).toBeLessThanOrEqual(64);
  expect(
    await dialog.evaluate((el) => {
      const r = el.getBoundingClientRect(),
        h = el.querySelector("h2")!.getBoundingClientRect(),
        f = el.querySelector(".dialog-actions")!.getBoundingClientRect();
      return (
        h.top >= r.top &&
        h.bottom <= r.bottom &&
        f.top >= r.top &&
        f.bottom <= r.bottom
      );
    }),
  ).toBe(true);
  await page.screenshot({
    path: `/tmp/runset-history-browsing-${info.project.name || "chromium"}-${locale}.png`,
  });
  await activate(b("Clear records"));
  await activate(b("Keep history"));
  await expect(filter).toHaveValue("hard");
  expect(await snapshot()).toEqual(before);
  await page.keyboard.press("Escape");
  await expect(b("Round history")).toBeFocused();
  await activate(b("Round history"));
  await expect(filter).toHaveValue("all");
  await expect(rows).toHaveCount(3);
  expect(await snapshot()).toEqual(before);
  await page.reload();
  if (locale === "zh-CN") {
    await expect(page.locator(".resume-context")).toBeVisible();
    await activate(page.locator(".simple-options > summary"));
  }
  await activate(b("Round history"));
  await expect(rows).toHaveCount(3);
  expect(await snapshot()).toEqual(before);
  await filter.selectOption("easy");
  await expect(rows).toHaveCount(1);
  await activate(b("Clear records"));
  await expect(dialog).toContainText(
    t(
      "This clears all recorded rounds, including records hidden by the filter. Your saved game, learning progress and settings are kept.",
    ),
  );
  await activate(b("Clear history"));
  await expect(rows).toHaveCount(0);
  await expect(filter).toHaveValue("all");
  const kept = { ...before };
  delete kept["runset.roundHistory.v1"];
  await expect.poll(snapshot).toEqual(kept);
  expect(errors).toEqual([]);
}
