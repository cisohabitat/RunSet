import {
  expect,
  type Page,
  type BrowserContext,
  type TestInfo,
} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { landscapePosition } from "./landscape";
import { validSave } from "../../src/lib/storage";
import { inspectMeld } from "../../src/engine/meld";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";
export async function verifyBotDecisions(
  page: Page,
  context: BrowserContext,
  info: TestInfo,
  locale: "en" | "zh-CN",
  offline = true,
) {
  const t = locale === "en" ? (s: string) => s : translator(messages);
  const make = (opening: boolean) => {
    const s = landscapePosition();
    delete s.deadline;
    delete s.turnSeconds;
    delete s.match;
    s.seed = opening ? 4321 : 4322;
    s.coach = false;
    s.current = 1;
    s.table = opening
      ? []
      : [
          { id: "fours", tiles: [29, 55, 81] },
          { id: "run", tiles: [0, 1, 2] },
        ];
    s.players[0].rack = [12, 25, 51];
    s.players[0].melded = !opening;
    s.players[1].rack = opening ? [3, 4, 6, 7, 38, 64, 104] : [3, 4];
    s.players[1].melded = !opening;
    s.players[1].bot = locale === "en" ? "normal" : "hard";
    s.players[1].name = "Pass";
    const used = new Set([
      ...s.table.flatMap((m) => m.tiles),
      ...s.players.flatMap((p) => p.rack),
    ]);
    s.pool = Array.from({ length: 106 }, (_, i) => i).filter(
      (id) => !used.has(id),
    );
    s.turnStart = {
      table: structuredClone(s.table),
      rack: [...s.players[1].rack],
    };
    expect(validSave(s)).toBe(true);
    return s;
  };
  const opening = make(true),
    ending = make(false),
    errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({
    reducedMotion: "reduce",
    colorScheme: locale === "en" ? "light" : "dark",
  });
  await page.addInitScript(
    ({ opening, locale }) => {
      if (sessionStorage.getItem("bot-decisions-seeded")) return;
      sessionStorage.setItem("bot-decisions-seeded", "1");
      localStorage.setItem("runset.save.v1", JSON.stringify(opening));
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.reading", String(locale === "zh-CN"));
    },
    { opening, locale },
  );
  const save = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("runset.save.v1")!));
  const resume = async () => {
    const b = page.getByRole("button", {
      name: t("Continue game →"),
      exact: true,
    });
    await b.scrollIntoViewIfNeeded();
    expect(
      await b.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return (
          r.width >= 44 &&
          r.height >= 44 &&
          r.left >= 0 &&
          r.right <= innerWidth &&
          r.top >= 0 &&
          r.bottom <= innerHeight &&
          el.contains(
            document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2),
          )
        );
      }),
    ).toBe(true);
    if (info.project.name === "firefox-desktop") await b.click();
    else await b.tap();
  };
  await page.goto("/");
  if (offline) {
    await expect(
      page.getByRole("status").filter({ hasText: t("Ready offline") }),
    ).toBeVisible();
    await context.setOffline(true);
    await page.reload();
  }
  await resume();
  await expect.poll(async () => (await save()).players[1].melded).toBe(true);
  const opened = await save();
  expect(validSave(opened)).toBe(true);
  expect(opened.current).toBe(0);
  expect(opened.players[1].rack).toEqual([38, 64]);
  expect(opened.table).toHaveLength(1);
  expect(inspectMeld(opened.table[0].tiles).points).toBe(30);
  expect(opened.players[0].rack).toEqual(opening.players[0].rack);
  expect(opened.pool).toEqual(opening.pool);
  await page.evaluate(
    (game) => localStorage.setItem("runset.save.v1", JSON.stringify(game)),
    ending,
  );
  await page.reload();
  await resume();
  await expect(page.locator(".game-over")).toBeVisible();
  await expect.poll(async () => (await save()).phase).toBe("over");
  const final = await save();
  expect(validSave(final)).toBe(true);
  expect(final.phase).toBe("over");
  expect(final.players[1].rack).toEqual([]);
  expect(
    final.table.find((m: { id: string }) => m.id === "fours").tiles,
  ).toEqual([29, 55, 81]);
  expect(final.table.find((m: { id: string }) => m.id === "run").tiles).toEqual(
    [0, 1, 2, 3, 4],
  );
  expect(final.pool).toEqual(ending.pool);
  expect(final.players[0].rack).toEqual(ending.players[0].rack);
  await expect(page.locator(".game-over")).toContainText("Pass");
  expect(
    (await new AxeBuilder({ page }).include(".game-over").analyze()).violations,
  ).toEqual([]);
  await page.screenshot({
    path: `/tmp/runset-bot-decisions-${info.project.name || "chromium"}-${locale}.png`,
  });
  expect(errors).toEqual([]);
}
