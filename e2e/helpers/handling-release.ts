import {
  expect,
  type BrowserContext,
  type Locator,
  type Page,
  type TestInfo,
} from "@playwright/test";
import { readFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { landscapePosition } from "./landscape";
import { chooseView } from "./view";
import { importBackup } from "../../src/lib/backup";
import { validSave } from "../../src/lib/storage";
import {
  replayTurnPractice,
  turnPracticeOutcome,
} from "../../src/lib/turnPractice";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";
export async function verifyHandlingRelease(
  { page, context }: { page: Page; context: BrowserContext },
  info: TestInfo,
  locale: "en" | "zh-CN",
  keyboard = false,
) {
  const t = locale === "en" ? (s: string) => s : translator(messages),
    otherT = locale === "en" ? translator(messages) : (s: string) => s,
    game = landscapePosition();
  delete game.match;
  delete game.deadline;
  delete game.turnSeconds;
  game.coach = false;
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({
    reducedMotion: "reduce",
    colorScheme: locale === "en" ? "light" : "dark",
  });
  await page.addInitScript(
    ({ game, locale }) => {
      if (sessionStorage.getItem("handling-release-seeded")) return;
      sessionStorage.setItem("handling-release-seeded", "1");
      localStorage.setItem("runset.save.v1", JSON.stringify(game));
      localStorage.setItem("runset.language", locale);
    },
    { game, locale },
  );
  const activate = async (el: Locator) => {
    await el.scrollIntoViewIfNeeded();
    if (keyboard) await el.focus();
    expect(
      await el.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return el.contains(
          document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
        );
      }),
    ).toBe(true);
    if (keyboard)
      await el.press(
        await el.evaluate((el) => (el.tagName === "INPUT" ? "Space" : "Enter")),
      );
    else if (info.project.name === "firefox-desktop") await el.click();
    else await el.tap();
  };
  const button = (label: string) =>
    page.getByRole("button", { name: t(label), exact: true });
  const bytes = (key = "runset.save.v1") =>
    page.evaluate((key) => localStorage.getItem(key), key);
  const saved = async () => JSON.parse((await bytes())!);
  const order = () =>
    page
      .locator(".rack-tiles > .tile")
      .evaluateAll((els) =>
        els.map((el) => Number(el.getAttribute("data-tile-id"))),
      );
  const menu = async () => {
    if (
      !(await page
        .locator(".more-actions")
        .evaluate((el: HTMLDetailsElement) => el.open))
    )
      await activate(page.locator(".more-actions > summary"));
  };
  const closeMenu = async () => {
    if (
      await page
        .locator(".more-actions")
        .evaluate((el: HTMLDetailsElement) => el.open)
    )
      await activate(page.locator(".more-actions > summary"));
  };
  const resume = async () => {
    await activate(button("Continue game →"));
    await expect(page.locator(".rack")).toBeVisible();
  };
  await page.goto("/");
  if (!keyboard) {
    await expect(
      page.getByRole("status").filter({ hasText: t("Ready offline") }),
    ).toBeVisible();
    await context.setOffline(true);
  }
  await resume();
  await menu();
  await activate(button("Arrange rack"));
  const arrange = page.getByRole("dialog", {
    name: t("Arrange rack"),
    exact: true,
  });
  await activate(arrange.locator('[data-tile-id="4"]'));
  await activate(
    arrange.getByRole("button", { name: t("Move left"), exact: true }),
  );
  await activate(
    arrange.getByRole("button", { name: t("Keep order"), exact: true }),
  );
  await expect(arrange).not.toBeVisible();
  const manual = [4, 3, ...game.players[0].rack.slice(2)];
  await expect.poll(order).toEqual(manual);
  await closeMenu();
  for (const id of [3, 4])
    await activate(page.locator(`.rack [data-tile-id="${id}"]`));
  await activate(page.locator(".new-meld"));
  await expect.poll(async () => (await saved()).history?.length).toBe(1);
  const incomplete = await bytes();
  await menu();
  await activate(button("Why this move?"));
  const help = page.getByRole("dialog", { name: t("Move help"), exact: true });
  await expect(help).toContainText(
    t("Add red 6 from your rack to group/run 7."),
  );
  expect(
    (await help.locator('[data-tile-id="5"]').boundingBox())!.height,
  ).toBeCloseTo(88, 4);
  await activate(
    help.getByRole("button", { name: t("Back to table"), exact: true }),
  );
  expect(await bytes()).toBe(incomplete);
  await closeMenu();
  await activate(page.locator('.rack [data-tile-id="5"]'));
  await activate(page.locator(".meld-target").last());
  await expect.poll(async () => (await saved()).history?.length).toBe(2);
  const edited = await bytes();
  expect(validSave(await saved())).toBe(true);
  expect((await saved()).table.at(-1).tiles).toEqual([3, 4, 5]);
  await menu();
  await activate(button("Find latest placement"));
  await expect(page.locator('.table [data-tile-id="5"]')).toBeFocused();
  expect(await bytes()).toBe(edited);
  await activate(page.locator('.rack [data-tile-id="6"]'));
  await chooseView(page, "table", t);
  await expect(page.locator(".rack")).not.toBeVisible();
  await menu();
  await activate(button("Find selected tiles"));
  await expect(page.locator('.rack [data-tile-id="6"]')).toBeFocused();
  await expect(page.getByLabel(t("Table view"), { exact: true })).toHaveValue(
    "wide",
  );
  const tile = page.locator('.rack [data-tile-id="6"]');
  const originalSize = await tile.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { width: r.width, height: r.height };
  });
  // Leave Full screen through its visible control before using the header.
  await chooseView(page, "normal", t);
  const viewport = page.viewportSize()!;
  await page.setViewportSize({
    width: viewport.height,
    height: viewport.width,
  });
  await expect(tile).toHaveAttribute("aria-pressed", "true");
  expect(await bytes()).toBe(edited);
  expect(
    (await page.locator(".table").boundingBox())!.height,
  ).toBeGreaterThanOrEqual(180);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.setViewportSize(viewport);
  await expect(tile).toHaveAttribute("aria-pressed", "true");

  // Settings and a first offline language switch must keep the draft and selected physical tile.
  await activate(button("Settings"));
  const settings = page.getByRole("dialog", {
    name: t("Settings"),
    exact: true,
  });
  await activate(
    settings.getByLabel(t("Comfortable reading"), { exact: true }),
  );
  await activate(settings.getByLabel(t("Higher contrast"), { exact: true }));
  await activate(
    settings.getByRole("button", { name: t("Done"), exact: true }).first(),
  );
  await expect(tile).toHaveAttribute("aria-pressed", "true");
  expect(
    await tile.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { width: r.width, height: r.height };
    }),
  ).toEqual({ width: 58, height: 80 });
  await expect(page.locator("html")).toHaveAttribute("data-contrast", "high");
  const language = page.locator(
    '.site-header select[aria-label="语言 / Language"]',
  );
  await language.selectOption(locale === "en" ? "zh-CN" : "en");
  await expect(
    page.getByRole("button", { name: otherT("Settings"), exact: true }),
  ).toBeVisible();
  await expect(tile).toHaveAttribute("aria-pressed", "true");
  expect(await bytes()).toBe(edited);
  await language.selectOption(locale);
  await expect(button("Settings")).toBeVisible();
  // Return reading size once to check exact compact dimensions, then retain comfortable mode.
  await activate(button("Settings"));
  await activate(
    settings.getByLabel(t("Comfortable reading"), { exact: true }),
  );
  await activate(
    settings.getByRole("button", { name: t("Done"), exact: true }).first(),
  );
  expect(
    await tile.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { width: r.width, height: r.height };
    }),
  ).toEqual(originalSize);
  await activate(button("Settings"));
  await activate(
    settings.getByLabel(t("Comfortable reading"), { exact: true }),
  );
  await activate(
    settings.getByRole("button", { name: t("Done"), exact: true }).first(),
  );
  await chooseView(page, "wide", t);
  expect(
    await page.locator(".table").evaluate((el) => {
      const r = el.getBoundingClientRect();
      return Math.min(innerHeight, r.bottom) - Math.max(0, r.top);
    }),
  ).toBeGreaterThanOrEqual(
    (await page.evaluate(() => innerWidth)) <= 720 ? 300 : 450,
  );
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: `/tmp/runset-handling-release-${info.project.name}-${locale}-${keyboard ? "keyboard" : "pointer"}.png`,
  });
  await menu();
  await activate(button("Take a break"));
  await expect(button("Continue game →")).toBeVisible();
  expect(await bytes()).toBe(edited);
  // Use the new practice after editing a regular table, and retain its quiet draft through deletion.
  await activate(
    page.getByRole("button", { name: new RegExp(t("Learn to play")) }),
  );
  await activate(button("Practise a whole turn"));
  for (const id of [9, 35, 61])
    await activate(page.locator(`.rack [data-tile-id="${id}"]`));
  await activate(page.locator(".new-meld"));
  await activate(button("End turn →"));
  await expect(
    page.getByRole("heading", {
      name: t("Opening turn complete"),
      exact: true,
    }),
  ).toBeVisible();
  await activate(button("Try with fewer prompts"));
  await activate(page.locator('.rack [data-tile-id="9"]'));
  await activate(page.locator(".new-meld"));
  const practice = await bytes("runset.turnPractice.v1");
  expect(
    turnPracticeOutcome(replayTurnPractice(JSON.parse(practice!))!.game),
  ).toBe("playing");
  await activate(button("Exit practice"));
  await expect(button("Continue game →")).toBeVisible();
  expect(await bytes()).toBe(edited);
  const downloadEvent = page.waitForEvent("download");
  await activate(button("Export game backup"));
  const download = await downloadEvent,
    raw = await readFile((await download.path())!, "utf8"),
    exported = importBackup(raw);
  expect(exported).toEqual(JSON.parse(edited!));
  const preferenceKeys = [
    "runset.rackOrder.v1",
    "runset.turnPractice.v1",
    "runset.practice.v1",
    "runset.reading",
    "runset.contrast",
    "runset.language",
    "runset.tableExpanded",
  ];
  const preferences = await page.evaluate(
    (keys) =>
      Object.fromEntries(keys.map((key) => [key, localStorage.getItem(key)])),
    preferenceKeys,
  );
  await activate(button("Delete saved game"));
  await activate(button("Keep game"));
  expect(await bytes()).toBe(edited);
  await activate(button("Delete saved game"));
  await activate(button("Delete game"));
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect.poll(() => bytes()).toBeNull();
  expect(await bytes("runset.backup.v1")).toBeNull();
  expect(
    await page.evaluate(
      (keys) =>
        Object.fromEntries(keys.map((key) => [key, localStorage.getItem(key)])),
      preferenceKeys,
    ),
  ).toEqual(preferences);
  await page
    .getByLabel(t("Import game backup"), { exact: true })
    .setInputFiles({
      name: "handling-backup.json",
      mimeType: "application/json",
      buffer: Buffer.from(raw),
    });
  await expect(page.locator(".rack")).toBeVisible();
  await expect.poll(saved).toEqual(exported);
  await expect
    .poll(order)
    .toEqual(manual.filter((id) => exported.players[0].rack.includes(id)));
  expect(await bytes("runset.turnPractice.v1")).toBe(practice);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.reload();
  await resume();
  await expect(page.locator(".table .meld")).toHaveCount(7);
  expect(await saved()).toEqual(exported);
  await expect(page.locator("html")).toHaveAttribute("data-contrast", "high");
  expect(errors).toEqual([]);
}
