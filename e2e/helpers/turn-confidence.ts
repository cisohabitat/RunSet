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
export async function verifyTurnConfidence(
  page: Page,
  context: BrowserContext,
  info: TestInfo,
  locale: "en" | "zh-CN",
  offline: boolean,
) {
  const t = locale === "en" ? (s: string) => s : translator(messages),
    game = landscapePosition(),
    now = Date.now();
  delete game.match;
  game.coach = false;
  game.deadline = now + 120000;
  game.players[0].name = "constructor";
  game.players[0].rack = [3, 4];
  game.players[1].rack = [104];
  game.players[1].melded = false;
  game.table = [{ id: "run", tiles: [0, 1, 2] }];
  game.turnStart = { table: structuredClone(game.table), rack: [3, 4] };
  game.pool = Array.from({ length: 106 }, (_, i) => i).filter(
    (id) => ![0, 1, 2, 3, 4, 104].includes(id),
  );
  expect(validSave(game)).toBe(true);
  await page.clock.install({ time: now });
  await page.clock.setFixedTime(now);
  await page.emulateMedia({
    reducedMotion: "reduce",
    colorScheme: locale === "en" ? "light" : "dark",
  });
  await page.addInitScript(
    ({ game, locale }) => {
      if (sessionStorage.getItem("turn-confidence-seed")) return;
      sessionStorage.setItem("turn-confidence-seed", "1");
      localStorage.setItem("runset.save.v1", JSON.stringify(game));
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.pace", "5000");
      localStorage.setItem("runset.reading", String(locale === "zh-CN"));
    },
    { game, locale },
  );
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const b = (s: string) =>
      page.getByRole("button", { name: t(s), exact: true }),
    save = () => page.evaluate(() => localStorage.getItem("runset.save.v1"));
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
  await activate(b("Continue game →"));
  const status = page.locator(".status-line");
  await expect(status).toHaveAttribute("data-turn-state", "start");
  await expect(status).toContainText(t("Choose tiles or draw"));
  await activate(page.locator('.rack [data-tile-id="3"]'));
  await activate(page.locator("main.game .new-meld"));
  await expect(status).toHaveAttribute("data-turn-state", "unfinished");
  await expect(status).toContainText(t("Unfinished turn"));
  if (locale === "zh-CN") await page.screenshot({path:`/tmp/runset-turn-confidence-${info.project.name||"chromium"}-${locale}-draft.png`});
  const draft = JSON.parse((await save())!);
  expect(draft.turn).toBe(1);
  expect(draft.deadline).toBe(game.deadline);
  await activate(page.locator(".primary-actions > button.primary"));
  await expect(page.getByRole("dialog")).toBeVisible();
  await activate(b("Keep editing"));
  await expect(status).toHaveAttribute("data-turn-state", "unfinished");
  await activate(b("Reset turn"));
  await expect(status).toHaveAttribute("data-turn-state", "start");
  await activate(page.locator('.rack [data-tile-id="3"]'));
  await activate(b("Add selected tiles to meld 1"));
  await expect(status).toHaveAttribute("data-turn-state", "ready");
  await expect(status).toContainText(t("Ready to end turn"));
  await expect
    .poll(async () => JSON.parse((await save())!).table[0].tiles.length)
    .toBe(4);
  const ready = JSON.parse((await save())!);
  expect(ready.phase).toBe("playing");
  expect(ready.turn).toBe(1);
  expect(ready.deadline).toBe(game.deadline);
  expect(validSave(ready)).toBe(true);
  await activate(b("Undo move"));
  await expect(status).toHaveAttribute("data-turn-state", "start");
  await activate(page.locator('.rack [data-tile-id="3"]'));
  await activate(b("Add selected tiles to meld 1"));
  await expect(status).toHaveAttribute("data-turn-state", "ready");
  expect(
    (await new AxeBuilder({ page }).include("main.game").analyze()).violations,
  ).toEqual([]);
  await page.screenshot({
    path: `/tmp/runset-turn-confidence-${info.project.name || "chromium"}-${locale}.png`,
  });
  if (locale === "en") {
    await activate(b("Reset turn"));
    await activate(page.locator('.rack [data-tile-id="3"]'));
    await activate(page.locator("main.game .new-meld"));
    await page.clock.setFixedTime(now + 120001);
    await page.clock.runFor(501);
    await expect(status).toHaveAttribute("data-turn-state", "waiting");
    await expect.poll(async () => JSON.parse((await save())!).turn).toBe(2);
    const expired = JSON.parse((await save())!);
    expect(expired.players[0].rack.length).toBe(3);
    expect(expired.table).toEqual(game.table);
    expect(validSave(expired)).toBe(true);
  } else {
    await activate(page.locator(".primary-actions > button.primary"));
    await expect(status).toHaveAttribute("data-turn-state", "waiting");
    await expect(status).toContainText(t("Opponent turn"));
    await expect.poll(async () => JSON.parse((await save())!).turn).toBe(2);
    const accepted = JSON.parse((await save())!);
    expect(accepted.table[0].tiles).toEqual([0, 1, 2, 3]);
    expect(accepted.players[0].rack).toEqual([4]);
    expect(accepted.notice).toContain("constructor played 1 tile");
    expect(validSave(accepted)).toBe(true);
  }
  // A legal public-table rearrangement alone is still not a completed turn.
  const split = structuredClone(game);
  delete split.deadline;
  delete split.turnSeconds;
  split.players[0].rack = [12];
  split.table = [{ id: "long-run", tiles: [0, 1, 2, 3, 4, 5] }];
  split.turnStart = { table: structuredClone(split.table), rack: [12] };
  split.pool = Array.from({ length: 106 }, (_, id) => id).filter(
    (id) => ![0, 1, 2, 3, 4, 5, 12, 104].includes(id),
  );
  expect(validSave(split)).toBe(true);
  await page.evaluate(
    (split) => localStorage.setItem("runset.save.v1", JSON.stringify(split)),
    split,
  );
  await page.reload();
  await activate(b("Continue game →"));
  for (const id of [3, 4, 5])
    await activate(page.locator(`.meld-tiles [data-tile-id="${id}"]`));
  await activate(page.locator("main.game .new-meld"));
  await expect(status).toHaveAttribute("data-turn-state", "rearranged");
  await expect(status).toContainText(t("Play a rack tile"));
  await activate(page.locator(".primary-actions > button.primary"));
  await expect(status).toHaveAttribute("data-turn-state", "rearranged");
  await expect
    .poll(async () => JSON.parse((await save())!).notice)
    .toBe("Play at least one rack tile, or draw to end your turn.");
  const rearranged = JSON.parse((await save())!);
  expect(rearranged.turn).toBe(1);
  expect(rearranged.players[0].rack).toEqual([12]);
  expect(validSave(rearranged)).toBe(true);
  expect(errors).toEqual([]);
}
