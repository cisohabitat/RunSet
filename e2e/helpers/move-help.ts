import {
  expect,
  type Locator,
  type Page,
  type BrowserContext,
  type TestInfo,
} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { landscapePosition } from "./landscape";
import { validSave } from "../../src/lib/storage";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";
export async function verifyMoveHelp(
  { page, context }: { page: Page; context: BrowserContext },
  info: TestInfo,
  locale: "en" | "zh-CN",
) {
  const t = locale === "en" ? (s: string) => s : translator(messages),
    game = landscapePosition(),
    now = Date.now();
  delete game.match;
  game.coach = false;
  game.lastPlaced = [0, 1, 2];
  if (locale === "en") {
    game.deadline = now + 120000;
    await page.clock.install({ time: now });
  } else {
    delete game.turnSeconds;
    delete game.deadline;
  }
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({
    colorScheme: locale === "en" ? "light" : "dark",
    reducedMotion: "reduce",
  });
  await page.addInitScript(
    ({ game, locale }) => {
      if (sessionStorage.getItem("help-seeded")) return;
      sessionStorage.setItem("help-seeded", "1");
      localStorage.setItem("runset.save.v1", JSON.stringify(game));
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.reading", String(locale === "zh-CN"));
      localStorage.setItem("runset.narrate", "true");
    },
    { game, locale },
  );
  const activate = async (control: Locator) => {
    await control.scrollIntoViewIfNeeded();
    expect(
      await control.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return el.contains(
          document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
        );
      }),
    ).toBe(true);
    if (info.project.name === "firefox-desktop") await control.click();
    else await control.tap();
  };
  const save = () =>
    page.evaluate(() => localStorage.getItem("runset.save.v1"));
  const resume = async () => {
    await activate(
      page.getByRole("button", { name: t("Continue game →"), exact: true }),
    );
    await expect(page.locator(".rack")).toBeVisible();
  };
  const more = page.locator(".more-actions");
  const menu = async () => {
    if (!(await more.evaluate((el: HTMLDetailsElement) => el.open)))
      await activate(more.locator(":scope > summary"));
  };
  const closeMenu = async () => {
    if (await more.evaluate((el: HTMLDetailsElement) => el.open))
      await activate(more.locator(":scope > summary"));
  };
  const helpGroup = page.getByRole("region", { name: t("Help with this turn"), exact: true });
  const arrangeGroup = page.getByRole("region", { name: t("Find and arrange tiles"), exact: true });
  const detailsGroup = page.getByRole("region", { name: t("Game details"), exact: true });
  const opener = page.getByRole("button", {
      name: t("Why this move?"),
      exact: true,
    }),
    panel = page.getByRole("dialog", { name: t("Move help"), exact: true });
  const verifyBlocked = async (
    reason: string,
    ids: number[],
    next: string,
    escape: boolean,
  ) => {
    await expect(page.locator(".game-notice")).toHaveText(t(reason));
    await expect
      .poll(async () => JSON.parse((await save())!).notice)
      .toBe(reason);
    const before = await save();
    await menu();
    await expect(helpGroup).toContainText(t("What can I do now?"));
    await expect(helpGroup.getByRole("button", { name: t("Why this move?"), exact: true })).toBeEnabled();
    await expect(arrangeGroup.getByRole("button", { name: t("Return selected tiles to rack"), exact: true })).toHaveCount(1);
    await expect(detailsGroup).toContainText(t("Opponent styles and fair play"));
    await activate(opener);
    await expect(panel).toBeVisible();
    await expect(panel).toContainText(t("Last blocked move"));
    await expect(panel).toContainText(t(reason));
    await expect(panel).toContainText(t(next));
    expect(
      await panel
        .getByRole("region", { name: t("Move explanation") })
        .locator(".tile")
        .evaluateAll((els) =>
          els.map((el) => Number(el.getAttribute("data-tile-id"))),
        ),
    ).toEqual(ids);
    if (escape) await page.keyboard.press("Escape");
    else
      await activate(
        panel.getByRole("button", { name: t("Back to table"), exact: true }),
      );
    await expect(panel).not.toBeVisible();
    await expect(opener).toBeFocused();
    for (const id of ids)
      await expect(
        page.locator(
          `.table [data-tile-id="${id}"],.rack [data-tile-id="${id}"]`,
        ),
      ).toHaveAttribute("aria-pressed", "true");
    expect(await save()).toBe(before);
  };
  const fresh = async (opened: boolean) => {
    const next = structuredClone(game);
    next.players[0].melded = opened;
    expect(validSave(next)).toBe(true);
    await page.evaluate(
      (next) => localStorage.setItem("runset.save.v1", JSON.stringify(next)),
      next,
    );
    await page.reload();
    await resume();
  };
  await page.goto("/");
  await expect(
    page.getByRole("status").filter({ hasText: t("Ready offline") }),
  ).toBeVisible();
  await context.setOffline(true);
  await resume();
  await activate(page.locator('.table [data-tile-id="0"]'));
  await menu();
  await activate(
    page.getByRole("button", {
      name: t("Return selected tiles to rack"),
      exact: true,
    }),
  );
  await verifyBlocked(
    "Table tiles cannot return to your rack.",
    [0],
    "Choose a group/run on the table as the destination.",
    true,
  );
  await fresh(false);
  await activate(page.locator('.rack [data-tile-id="3"]'));
  await activate(page.locator(".meld-target").first());
  await verifyBlocked(
    "Your opening meld must come entirely from your rack.",
    [3],
    "Choose New group or run for your opening.",
    false,
  );
  await page.keyboard.press("Escape");
  await closeMenu();
  await activate(page.locator('.table [data-tile-id="0"]'));
  await activate(page.locator(".new-meld"));
  await verifyBlocked(
    "Open with 30 points before rearranging table tiles.",
    [0],
    "Clear selection, then choose only rack tiles for your opening.",
    true,
  );
  await fresh(true);
  for (const id of [3, 4])
    await activate(page.locator(`.rack [data-tile-id="${id}"]`));
  await activate(page.locator(".new-meld"));
  await expect
    .poll(async () => JSON.parse((await save())!).history?.length)
    .toBe(1);
  const before = await save();
  await menu();
  await activate(opener);
  await expect(panel).toContainText(t("Current draft"));
  await expect(panel).toContainText(
    t("Add red 6 from your rack to group/run 7."),
  );
  await expect(
    panel
      .getByRole("region", { name: t("Move explanation") })
      .getByRole("region", { name: t("Tiles in this move") }),
  ).toHaveCount(1);
  const affected = panel.getByRole("region", {
    name: t("Tiles in this move"),
  });
  await expect(affected.locator(".tile")).toHaveCount(2);
  const candidate = panel
    .getByRole("region", { name: t("One tile you can add") })
    .locator('[data-tile-id="5"]');
  await expect(candidate).toBeVisible();
  await expect(panel).toContainText(t("Affected group/run 7"));
  await expect(panel).toContainText(
    t("After this change, choose End turn to check and keep the whole turn."),
  );

  const size = (await candidate.boundingBox())!;
  expect(size.width).toBe(64);
  expect(size.height).toBeCloseTo(88, 4);
  expect(await candidate.evaluate((el) => getComputedStyle(el).height)).toBe(
    "88px",
  );
  expect(
    (await new AxeBuilder({ page }).include(".move-help").analyze()).violations,
  ).toEqual([]);
  const back = panel.getByRole("button", {
    name: t("Back to table"),
    exact: true,
  });
  expect(
    (await back.boundingBox())!.y + (await back.boundingBox())!.height,
  ).toBeLessThanOrEqual(await page.evaluate(() => innerHeight));
  expect(await save()).toBe(before);
  await page.screenshot({
    path: `/tmp/runset-move-help-${info.project.name}-${locale}.png`,
  });
  if (locale === "zh-CN") {
    await activate(
      panel.getByRole("button", {
        name: t("Find affected tiles"),
        exact: true,
      }),
    );
    await expect(panel).not.toBeVisible();
    await expect(page.locator('.table [data-tile-id="3"]')).toBeFocused();
    await expect(page.locator('.table [data-tile-id="3"]')).not.toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(await save()).toBe(before);
    await menu();
    await activate(opener);
  }
  if (locale === "en") {
    await page.clock.fastForward(120001);
    await expect(panel).not.toBeVisible();
    await expect
      .poll(async () => JSON.parse((await save())!).turn)
      .toBeGreaterThan(game.turn);
    const after = JSON.parse((await save())!);
    expect(after.table).toEqual(game.table);
    expect(after.players[0].rack).toHaveLength(game.players[0].rack.length + 1);
    expect(validSave(after)).toBe(true);
  } else {
    await activate(back);
    await expect(opener).toBeFocused();
    expect(await save()).toBe(before);
    await closeMenu();
    await activate(
      page.getByRole("button", { name: t("Reset turn"), exact: true }),
    );
    await menu();
    await expect(opener).toBeDisabled();
  }
  expect(errors).toEqual([]);
}
