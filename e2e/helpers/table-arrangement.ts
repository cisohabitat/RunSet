import {
  expect,
  type Page,
  type BrowserContext,
  type Locator,
  type TestInfo,
} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { landscapePosition } from "./landscape";
import { chooseView } from "./view";
import { reducer } from "../../src/engine/game";
import { validSave } from "../../src/lib/storage";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";
export async function verifyTableArrangement(
  page: Page,
  context: BrowserContext,
  info: TestInfo,
  locale: "en" | "zh-CN",
  offline = true,
) {
  const t = locale === "en" ? (s: string) => s : translator(messages),
    now = Date.now(),
    original = landscapePosition();
  delete original.match;
  original.coach = false;
  if (locale === "en") {
    original.deadline = now + 120000;
    await page.clock.install({ time: now });
  } else {
    delete original.turnSeconds;
    delete original.deadline;
  }
  const game = reducer(original, { type: "move", ids: [3, 4], target: "new" }),
    draft = game.table.at(-1)!.id;
  expect(validSave(game)).toBe(true);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({
    colorScheme: locale === "en" ? "light" : "dark",
    reducedMotion: "reduce",
  });
  await page.addInitScript(
    ({ game, locale }) => {
      if (sessionStorage.getItem("arrangement-seeded")) return;
      sessionStorage.setItem("arrangement-seeded", "1");
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
    if (info.project.name === "firefox-desktop") await el.click();
    else await el.tap();
  };
  const save = () =>
    page.evaluate(() => localStorage.getItem("runset.save.v1"));
  await page.goto("/");
  if (offline) {
    await expect(
      page.getByRole("status").filter({ hasText: t("Ready offline") }),
    ).toBeVisible();
    await context.setOffline(true);
  }
  const resume = async () => {
    await activate(
      page.getByRole("button", { name: t("Continue game →"), exact: true }),
    );
    await expect(page.locator("main.game .table .meld")).toHaveCount(7);
  };
  await resume();
  const real = page.locator("main.game"),
    more = real.locator(".more-actions"),
    arrange = real.locator(".table-arrangement"),
    select = arrange.getByRole("combobox", {
      name: t("Table arrangement"),
      exact: true,
    });
  const menu = async () => {
    if (!(await more.evaluate((el: HTMLDetailsElement) => el.open)))
      await activate(more.locator(":scope > summary"));
  };
  const choices = async () => {
    await menu();
    if (!(await arrange.evaluate((el: HTMLDetailsElement) => el.open)))
      await activate(arrange.locator(":scope > summary"));
  };
  const closeMenu = async () => {
    if (await more.evaluate((el: HTMLDetailsElement) => el.open))
      await activate(more.locator(":scope > summary"));
  };
  const ids = () =>
    real
      .locator(".table .meld")
      .evaluateAll((els) => els.map((el) => el.getAttribute("data-meld-id")));
  await activate(real.locator('.rack [data-tile-id="5"]'));
  await chooseView(page, "table", t);
  const before = await save();
  await choices();
  await select.scrollIntoViewIfNeeded();
  expect(
    await select.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return (
        r.height >= 48 &&
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
  await select.focus();
  await select.selectOption("kind");
  await expect(select).toBeFocused();
  await expect
    .poll(ids)
    .toEqual([
      draft,
      "tens",
      "elevens",
      "red-run",
      "blue-run",
      "orange-run",
      "black-run",
    ]);
  expect(await save()).toBe(before);
  await page.screenshot({
    path: `/tmp/runset-table-arrangement-menu-${info.project.name || "chromium"}-${locale}.png`,
  });
  await expect(real.locator(".rack")).not.toBeVisible();
  await expect(real.locator(".table .meld").first()).toHaveAttribute(
    "data-meld-index",
    "7",
  );
  await expect(
    real.locator(".table .meld").first().locator(".meld-index"),
  ).toHaveText("7 ·");
  expect(
    await page.evaluate(() => localStorage.getItem("runset.tableOrder.v1")),
  ).toBe("kind");
  await closeMenu();
  await activate(
    real.getByRole("button", {
      name: t("Add selected tiles to meld 7"),
      exact: true,
    }),
  );
  await expect
    .poll(async () => JSON.parse((await save())!).history.length)
    .toBe(2);
  const placed = JSON.parse((await save())!);
  expect(placed.table[0].id).toBe("red-run");
  expect(placed.table.at(-1).tiles).toEqual([3, 4, 5]);
  expect(placed.deadline).toBe(game.deadline);
  expect(validSave(placed)).toBe(true);
  await activate(
    real.getByRole("button", { name: t("Undo move"), exact: true }),
  );
  await expect
    .poll(async () => JSON.parse((await save())!).table)
    .toEqual(game.table);
  const afterUndo = await save();
  await choices();
  await select.selectOption("colour");
  await expect
    .poll(ids)
    .toEqual([
      draft,
      "red-run",
      "blue-run",
      "orange-run",
      "black-run",
      "tens",
      "elevens",
    ]);
  expect(await save()).toBe(afterUndo);
  // A failed optional preference write must leave gameplay and current display usable.
  await page.evaluate(() => {
    const set = Storage.prototype.setItem;
    (window as any).__orderWriteAllowed = false;
    Storage.prototype.setItem = function (k: string, v: string) {
      if (k === "runset.tableOrder.v1" && !(window as any).__orderWriteAllowed)
        throw Error("quota");
      return set.call(this, k, v);
    };
  });
  await select.selectOption("kind");
  await expect(arrange.getByRole("status")).toHaveText(
    t(
      "The table view changed, but this browser could not remember the choice.",
    ),
  );
  expect(
    await page.evaluate(() => localStorage.getItem("runset.tableOrder.v1")),
  ).toBe("colour");
  expect(await save()).toBe(afterUndo);
  await page.evaluate(() => ((window as any).__orderWriteAllowed = true));
  await select.selectOption("placed");
  await expect.poll(ids).toEqual(game.table.map((m) => m.id));
  await select.selectOption("colour");
  await closeMenu();
  expect(
    (await new AxeBuilder({ page }).include("main.game").analyze()).violations,
  ).toEqual([]);
  await page.screenshot({
    path: `/tmp/runset-table-arrangement-${info.project.name || "chromium"}-${locale}.png`,
  });
  await page.reload();
  await resume();
  await expect
    .poll(ids)
    .toEqual([
      draft,
      "red-run",
      "blue-run",
      "orange-run",
      "black-run",
      "tens",
      "elevens",
    ]);
  expect(await save()).toBe(afterUndo);
  if (locale === "en") {
    await page.clock.fastForward(120001);
    await expect
      .poll(async () => JSON.parse((await save())!).turn)
      .toBeGreaterThan(game.turn);
    expect(
      await page.evaluate(() => localStorage.getItem("runset.tableOrder.v1")),
    ).toBe("colour");
    expect(validSave(JSON.parse((await save())!))).toBe(true);
  } else {
    await chooseView(page, "normal", t);
    await activate(page.getByRole("button", { name: t("Home"), exact: true }));
    await activate(
      page.getByRole("button", { name: t("Delete saved game"), exact: true }),
    );
    await activate(
      page.getByRole("button", { name: t("Delete game"), exact: true }),
    );
    await expect.poll(save).toBeNull();
    expect(
      await page.evaluate(() => localStorage.getItem("runset.tableOrder.v1")),
    ).toBe("colour");
  }
  expect(errors).toEqual([]);
}
