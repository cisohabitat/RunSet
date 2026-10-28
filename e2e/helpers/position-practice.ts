import {
  expect,
  type Page,
  type BrowserContext,
  type Locator,
  type TestInfo,
} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { landscapePosition } from "./landscape";
import { reducer } from "../../src/engine/game";
import { validSave } from "../../src/lib/storage";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";
export async function verifyPositionPractice(
  page: Page,
  context: BrowserContext,
  info: TestInfo,
  locale: "en" | "zh-CN",
  offline = true,
) {
  const t = locale === "en" ? (s: string) => s : translator(messages),
    now = Date.now();
  const original = landscapePosition();
  delete original.match;
  original.coach = false;
  if (locale === "en") {
    original.deadline = now + 120000;
    await page.clock.install({ time: now });
  } else {
    delete original.turnSeconds;
    delete original.deadline;
  }
  const game = reducer(original, { type: "move", ids: [3, 4], target: "new" });
  expect(validSave(game)).toBe(true);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({
    colorScheme: locale === "en" ? "light" : "dark",
    reducedMotion: "reduce",
  });
  await page.addInitScript(
    ({ game, locale }) => {
      if (sessionStorage.getItem("position-copy-seeded")) return;
      sessionStorage.setItem("position-copy-seeded", "1");
      localStorage.setItem("runset.save.v1", JSON.stringify(game));
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.reading", String(locale === "zh-CN"));
      localStorage.setItem("runset.tableExpanded", "true");
    },
    { game, locale },
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
  const save = () =>
    page.evaluate(() => localStorage.getItem("runset.save.v1"));
  const preferences = () =>
    page.evaluate(() =>
      Object.fromEntries(
        Object.keys(localStorage)
          .filter(
            (k) =>
              k.startsWith("runset.") &&
              k !== "runset.save.v1" &&
              k !== "runset.backup.v1",
          )
          .map((k) => [k, localStorage.getItem(k)]),
      ),
    );
  await page.goto("/");
  if (offline) {
    await expect(
      page.getByRole("status").filter({ hasText: t("Ready offline") }),
    ).toBeVisible();
    await context.setOffline(true);
  }
  await activate(
    page.getByRole("button", { name: t("Continue game →"), exact: true }),
  );
  const real = page.locator("main.game");
  await activate(real.locator('.rack [data-tile-id="12"]'));
  const before = await save(),
    prefs = await preferences();
  const more = real.locator(".more-actions");
  await activate(more.locator(":scope > summary"));
  const opener = real.getByRole("button", {
    name: t("Practise this position"),
    exact: true,
  });
  await activate(opener);
  const copy = page.getByRole("dialog", {
    name: t("Practise this position"),
    exact: true,
  });
  await expect(copy).toBeVisible();
  await expect(copy.locator(".opponents,.pool-count,.table-tools")).toHaveCount(
    0,
  );
  await expect(
    copy.getByRole("button", { name: t("Pass"), exact: false }),
  ).toHaveCount(0);
  await expect(copy.locator('.rack [data-tile-id="12"]')).not.toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(copy.locator(".table .meld")).toHaveCount(7);
  await activate(
    copy.getByRole("button", { name: t("Check this turn"), exact: true }),
  );
  await expect(copy.locator(".practice-feedback")).toHaveText(
    t("Every meld needs a valid group or run."),
  );
  await expect(copy.locator(".rack .tile")).toHaveCount(
    game.players[0].rack.length,
  );
  const place = async () => {
    await activate(copy.locator('.rack [data-tile-id="5"]'));
    await activate(copy.locator(".meld-target").last());
  };
  await place();
  await expect(
    copy.locator(".table .meld").last().locator(".tile"),
  ).toHaveCount(3);
  if (locale === "en") {
    const rows = await copy
      .locator(".table .meld")
      .evaluateAll((els) =>
        els.slice(0, 2).map((el) => el.getBoundingClientRect().top),
      );
    expect(Math.abs(rows[0] - rows[1])).toBeLessThan(2);
  }
  await page.screenshot({
    path: `/tmp/runset-position-copy-board-${info.project.name || "chromium"}-${locale}.png`,
  });
  await activate(
    copy.getByRole("button", { name: t("Undo move"), exact: true }),
  );
  await expect(
    copy.locator(".table .meld").last().locator(".tile"),
  ).toHaveCount(2);
  await activate(
    copy.getByRole("button", { name: t("Reset turn"), exact: true }),
  );
  await expect(copy.locator(".table .meld")).toHaveCount(6);
  await activate(
    copy.getByRole("button", { name: t("Restart practice copy"), exact: true }),
  );
  await expect(copy.locator(".table .meld")).toHaveCount(7);
  await place();
  await activate(copy.locator('.table [data-tile-id="5"]'));
  await activate(
    copy.getByRole("button", {
      name: t("Return selected tiles to rack"),
      exact: true,
    }),
  );
  await expect(copy.locator('.rack [data-tile-id="5"]')).toHaveCount(1);
  await place();
  await activate(
    copy.getByRole("button", { name: t("Check this turn"), exact: true }),
  );
  await expect(
    copy.getByRole("heading", {
      name: t("This practice turn is valid"),
      exact: true,
    }),
  ).toBeVisible();
  expect(await save()).toBe(before);
  expect(await preferences()).toEqual(prefs);
  const ids = await page
    .locator("[id]")
    .evaluateAll((els) => els.map((el) => el.id));
  expect(new Set(ids).size).toBe(ids.length);
  expect(
    (await new AxeBuilder({ page }).include(".position-practice").analyze())
      .violations,
  ).toEqual([]);
  await page.screenshot({
    path: `/tmp/runset-position-copy-${info.project.name || "chromium"}-${locale}.png`,
  });
  await activate(
    copy.getByRole("button", { name: t("Return to saved game"), exact: true }),
  );
  await expect(copy).toHaveCount(0);
  await expect(opener).toBeFocused();
  await expect(real.locator('.rack [data-tile-id="12"]')).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(await save()).toBe(before);
  await activate(opener);
  await activate(copy.locator('.rack [data-tile-id="5"]'));
  await copy.locator('.rack [data-tile-id="5"]').focus();
  await page.keyboard.press("n");
  await expect(copy.locator(".table .meld")).toHaveCount(8);
  await expect(copy.locator('.rack button[tabindex="0"]')).toBeFocused();
  await page.keyboard.press("Control+z");
  await expect(copy.locator(".table .meld")).toHaveCount(7);
  await page.keyboard.press("Escape");
  await expect(copy).toHaveCount(0);
  await expect(opener).toBeFocused();
  expect(await save()).toBe(before);
  if (locale === "en") {
    await activate(opener);
    await page.clock.fastForward(120001);
    await expect(copy).toHaveCount(0);
    await expect
      .poll(async () => JSON.parse((await save())!).turn)
      .toBeGreaterThan(game.turn);
    const after = JSON.parse((await save())!);
    expect(after.table).toEqual(original.table);
    expect(validSave(after)).toBe(true);
  } else {
    await page.reload();
    await activate(
      page.getByRole("button", { name: t("Continue game →"), exact: true }),
    );
    expect(await save()).toBe(before);
  }
  expect(await preferences()).toEqual(prefs);
  expect(errors).toEqual([]);
}
