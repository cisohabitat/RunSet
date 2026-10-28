import {
  expect,
  type Page,
  type BrowserContext,
  type TestInfo,
  type Locator,
} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { landscapePosition } from "./landscape";
import { validSave } from "../../src/lib/storage";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";
export async function verifyRecentTurns(
  page: Page,
  context: BrowserContext,
  info: TestInfo,
  locale: "en" | "zh-CN",
  offline = true,
) {
  const t = locale === "en" ? (s: string) => s : translator(messages),
    game = landscapePosition(),
    now = Date.now();
  delete game.match;
  game.coach = false;
  game.players[0].name = "constructor";
  game.players[0].rack = [3, 4];
  game.players[1].rack = [104];
  game.players[1].melded = false;
  game.players[1].name = "Pass";
  game.table = [{ id: "run", tiles: [0, 1, 2] }];
  game.pool = Array.from({ length: 106 }, (_, i) => i).filter(
    (id) => ![0, 1, 2, 3, 4, 104].includes(id),
  );
  game.turnStart = { table: structuredClone(game.table), rack: [3, 4] };
  if (locale === "en") {
    game.deadline = now + 120000;
    await page.clock.install({ time: now });
  } else {
    delete game.deadline;
    delete game.turnSeconds;
  }
  expect(validSave(game)).toBe(true);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({
    reducedMotion: "reduce",
    colorScheme: locale === "en" ? "light" : "dark",
  });
  await page.addInitScript(
    ({ game, locale }) => {
      if (sessionStorage.getItem("recent-seeded")) return;
      sessionStorage.setItem("recent-seeded", "1");
      localStorage.setItem("runset.save.v1", JSON.stringify(game));
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.pace", "700");
      localStorage.setItem("runset.reading", String(locale === "zh-CN"));
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
  const b = (name: string) =>
      page.getByRole("button", { name: t(name), exact: true }),
    save = () => page.evaluate(() => localStorage.getItem("runset.save.v1"));
  await page.goto("/");
  if (offline) {
    await expect(
      page.getByRole("status").filter({ hasText: t("Ready offline") }),
    ).toBeVisible();
    await context.setOffline(true);
  }
  await activate(b("Continue game →"));
  const menu = page.locator(".more-actions > summary"),
    dialog = page.getByRole("dialog", {
      name: t("Recent public turns"),
      exact: true,
    });
  await activate(menu);
  await activate(b("Replay recent turns"));
  await expect(dialog).toContainText(
    t("No completed turns recorded yet. Play a turn, then return here."),
  );
  await activate(dialog.getByRole("button", { name: t("Done"), exact: true }));
  await expect(b("Replay recent turns")).toBeFocused();
  await activate(menu);
  await activate(page.locator('.rack [data-tile-id="3"]'));
  await activate(b("Add selected tiles to meld 1"));
  await activate(b("End turn →"));
  await expect.poll(async () => JSON.parse((await save())!).turn).toBe(3);
  await activate(page.locator('.rack [data-tile-id="4"]'));
  const before = await save();
  await activate(menu);
  await activate(b("Replay recent turns"));
  await expect(dialog).toContainText(t("Public table unchanged"));
  await activate(
    dialog.getByRole("button", { name: t("Previous turn"), exact: true }),
  );
  await expect(dialog.getByRole("status")).toContainText("constructor");
  await expect(dialog.locator(".tile")).toHaveCount(4);
  await activate(
    dialog.getByRole("button", { name: t("Before turn"), exact: true }),
  );
  await expect(dialog.locator(".tile")).toHaveCount(3);
  await activate(
    dialog.getByRole("button", { name: t("After turn"), exact: true }),
  );
  await expect(dialog.locator(".tile.glow")).toHaveCount(1);
  await expect(dialog).toContainText(t("red 4"));
  expect(
    (await new AxeBuilder({ page }).include(".recent-turns").analyze())
      .violations,
  ).toEqual([]);
  expect(await save()).toBe(before);
  await expect(
    page.locator('main.game .rack [data-tile-id="4"]'),
  ).toHaveAttribute("aria-pressed", "true");
  await page.screenshot({
    path: `/tmp/runset-recent-turns-${info.project.name || "chromium"}-${locale}.png`,
  });
  if (locale === "en") {
    await page.clock.fastForward(120001);
    await expect(dialog).toHaveCount(0);
    await expect
      .poll(async () => JSON.parse((await save())!).turn)
      .toBeGreaterThan(3);
  } else {
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(b("Replay recent turns")).toBeFocused();
    await activate(menu);
    await activate(b("Add selected tiles to meld 1"));
    await activate(b("End turn →"));
    await expect(page.locator(".game-over")).toBeVisible();
    await expect
      .poll(async () => JSON.parse((await save())!).phase)
      .toBe("over");
    const final = await save();
    await activate(b("Replay recent turns"));
    await expect(dialog.locator(".tile")).toHaveCount(5);
    await expect(dialog).toContainText(t("red 5"));
    expect(await save()).toBe(final);
    await page.reload();
    await activate(b("View results →"));
    await activate(b("Replay recent turns"));
    await expect(dialog).toContainText(
      t("No completed turns recorded yet. Play a turn, then return here."),
    );
    expect(await save()).toBe(final);
  }
  expect(errors).toEqual([]);
}
