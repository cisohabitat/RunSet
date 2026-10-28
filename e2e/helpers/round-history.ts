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
export async function verifyRoundHistory(
  page: Page,
  context: BrowserContext,
  info: TestInfo,
  locale: "en" | "zh-CN",
  offline: boolean,
) {
  const t = locale === "en" ? (s: string) => s : translator(messages),
    game = landscapePosition();
  delete game.match;
  delete game.deadline;
  delete game.turnSeconds;
  game.coach = false;
  game.players[0].name = "constructor";
  game.players[0].rack = [3];
  game.players[1].name = "Pass";
  game.players[1].rack = [104];
  game.table = [{ id: "run", tiles: [0, 1, 2] }];
  game.turnStart = { table: structuredClone(game.table), rack: [3] };
  game.pool = Array.from({ length: 106 }, (_, i) => i).filter(
    (id) => ![0, 1, 2, 3, 104].includes(id),
  );
  expect(validSave(game)).toBe(true);
  await page.emulateMedia({
    reducedMotion: "reduce",
    colorScheme: locale === "en" ? "light" : "dark",
  });
  await page.addInitScript(
    ({ game, locale }) => {
      if (sessionStorage.getItem("round-history-seed")) return;
      sessionStorage.setItem("round-history-seed", "1");
      localStorage.setItem("runset.save.v1", JSON.stringify(game));
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.simpleHome", String(locale === "zh-CN"));
      localStorage.setItem("runset.reading", String(locale === "zh-CN"));
    },
    { game, locale },
  );
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const b = (s: string) =>
      page.getByRole("button", { name: t(s), exact: true }),
    save = () => page.evaluate(() => localStorage.getItem("runset.save.v1")),
    records = () =>
      page.evaluate(() => localStorage.getItem("runset.roundHistory.v1"));
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
  const options = async () => {
    if (locale === "zh-CN") {
      await expect(page.locator(".simple-home")).toBeVisible();
      // The optional resume summary can arrive after Home's first layout.
      if (await b("Continue game →").count())
        await expect(page.locator(".resume-context")).toBeVisible();
      await activate(page.locator(".simple-options > summary"));
    }
  };
  await page.goto("/");
  if (offline) {
    await expect(
      page.getByRole("status").filter({ hasText: t("Ready offline") }),
    ).toBeVisible();
    await context.setOffline(true);
  }
  await options();
  await activate(b("Round history"));
  const dialog = page.getByRole("dialog", {
    name: t("Round history"),
    exact: true,
  });
  await expect(dialog).toContainText(
    t("No rounds recorded yet. Finish a round to add it here."),
  );
  await activate(dialog.getByRole("button", { name: t("Done"), exact: true }));
  await expect(b("Round history")).toBeFocused();
  await activate(b("Continue game →"));
  await activate(page.locator('.rack [data-tile-id="3"]'));
  await activate(b("Add selected tiles to meld 1"));
  await activate(b("End turn →"));
  await expect(page.locator(".game-over")).toBeVisible();
  await expect
    .poll(
      async () =>
        JSON.parse((await records()) ?? '{"rounds":[]}').rounds.length,
    )
    .toBe(1);
  await expect.poll(async () => JSON.parse((await save())!).phase).toBe("over");
  const final = await save(),
    history = await records();
  const parsed = JSON.parse(history!);
  expect(
    parsed.rounds[0].players.map((p: { score: number }) => p.score),
  ).toEqual([30, -30]);
  await activate(b("Round history"));
  await expect(dialog.locator(".round-records > li")).toHaveCount(1);
  await expect(dialog).toContainText("constructor");
  await expect(dialog).toContainText("Pass");
  await expect(dialog).toContainText("+30");
  await expect(dialog).toContainText("-30");
  expect(
    (await new AxeBuilder({ page }).include(".round-history").analyze())
      .violations,
  ).toEqual([]);
  await page.screenshot({
    path: `/tmp/runset-round-history-${info.project.name || "chromium"}-${locale}.png`,
  });
  await page.keyboard.press("Escape");
  await expect(b("Round history")).toBeFocused();
  await page.reload();
  expect(await records()).toBe(history);
  await activate(b("View results →"));
  await activate(b("Round history"));
  await expect(dialog.locator(".round-records > li")).toHaveCount(1);
  expect(await records()).toBe(history);
  expect(await save()).toBe(final);
  await activate(dialog.getByRole("button", { name: t("Done"), exact: true }));
  await activate(
    page
      .locator(".game-over")
      .getByRole("button", { name: t("Home"), exact: true }),
  );
  await options();
  const downloading = page.waitForEvent("download");
  await activate(b("Export game backup"));
  const download = await downloading,
    path = await download.path();
  expect(path).not.toBeNull();
  await activate(b("Delete saved game"));
  await activate(
    page
      .getByRole("dialog")
      .getByRole("button", { name: t("Delete game"), exact: true }),
  );
  await expect.poll(save).toBeNull();
  expect(await records()).toBe(history);
  await page.locator('.save-tools input[type="file"]').setInputFiles(path!);
  await expect(page.locator(".game-over")).toBeVisible();
  await expect.poll(save).toBe(final);
  await activate(b("Round history"));
  await expect(dialog.locator(".round-records > li")).toHaveCount(1);
  expect(await records()).toBe(history);
  await activate(b("Clear recorded rounds"));
  await expect(b("Clear history")).toBeFocused();
  await activate(b("Keep history"));
  await expect(b("Clear recorded rounds")).toBeFocused();
  expect(await records()).toBe(history);
  await activate(b("Clear recorded rounds"));
  await activate(b("Clear history"));
  await expect.poll(records).toBeNull();
  await expect(dialog).toContainText(
    t("No rounds recorded yet. Finish a round to add it here."),
  );
  expect(await save()).toBe(final);
  await activate(dialog.getByRole("button", { name: t("Done"), exact: true }));
  await page.reload();
  await activate(b("View results →"));
  await activate(b("Round history"));
  await expect(dialog).toContainText(
    t("No rounds recorded yet. Finish a round to add it here."),
  );
  expect(await records()).toBeNull();
  expect(await save()).toBe(final);
  expect(
    await page.evaluate(() => localStorage.getItem("runset.reading")),
  ).toBe(String(locale === "zh-CN"));
  expect(errors).toEqual([]);
}
