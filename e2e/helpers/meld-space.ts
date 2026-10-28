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
export async function verifyMeldSpace(
  page: Page,
  context: BrowserContext,
  info: TestInfo,
  locale: "en" | "zh-CN",
  offline = true,
) {
  const t = locale === "en" ? (s: string) => s : translator(messages),
    original = landscapePosition();
  delete original.deadline;
  delete original.turnSeconds;
  delete original.match;
  original.coach = false;
  original.lastPlaced = [1];
  const long = Array.from({ length: 13 }, (_, i) => i + 13);
  original.pool = original.pool.filter((id) => !long.includes(id));
  for (const player of original.players)
    player.rack = player.rack.filter((id) => !long.includes(id));
  original.table.push({ id: "long-run", tiles: long });
  original.turnStart = {
    table: structuredClone(original.table),
    rack: [...original.players[0].rack],
  };
  const game = reducer(original, { type: "move", ids: [3, 4], target: "new" });
  expect(validSave(game)).toBe(true);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({
    reducedMotion: "reduce",
    colorScheme: locale === "en" ? "light" : "dark",
  });
  await page.addInitScript(
    ({ game, locale }) => {
      if (sessionStorage.getItem("meld-space-seeded")) return;
      sessionStorage.setItem("meld-space-seeded", "1");
      localStorage.setItem("runset.save.v1", JSON.stringify(game));
      localStorage.setItem("runset.language", locale);
      localStorage.setItem("runset.tableOrder.v1", "kind");
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
    if (info.project.name === "firefox-desktop") await el.click();
    else await el.tap();
  };
  const button = (name: string) =>
    page.getByRole("button", { name: t(name), exact: true });
  const save = () =>
    page.evaluate(() => localStorage.getItem("runset.save.v1"));
  await page.goto("/");
  if (offline) {
    await expect(
      page.getByRole("status").filter({ hasText: t("Ready offline") }),
    ).toBeVisible();
    await context.setOffline(true);
    await page.reload();
  }
  await activate(button("Continue game →"));
  const before = await save();
  const recent = page.locator('main.game .table [data-tile-id="1"]');
  await expect(recent.locator(".tile-recent")).toBeVisible();
  await expect(recent).toHaveAttribute(
    "aria-description",
    t("Played in the latest turn."),
  );

  await activate(page.locator('.rack [data-tile-id="5"]'));

  const selected = page.locator('.rack [data-tile-id="5"]');
  await expect(selected).toHaveAttribute("aria-pressed", "true");
  await expect(selected.locator(".tile-check")).toBeVisible();
  expect(
    await selected.evaluate((el) => getComputedStyle(el).outlineStyle),
  ).toBe("solid");
  await chooseView(page, "table", t);
  const cards = page.locator("main.game .table .meld"),
    draft = cards.first();
  await expect(cards).toHaveCount(8);
  await expect(draft).toHaveAttribute("data-meld-index", "8");
  const order = await cards.evaluateAll((els) =>
    els.map((el) => el.getAttribute("data-meld-id")),
  );
  for (const width of [375, 1180]) {
    await page.setViewportSize({ width, height: width === 375 ? 667 : 820 });
    await expect
      .poll(() =>
        cards.first().evaluate((el) => el.getBoundingClientRect().width),
      )
      .toBeGreaterThanOrEqual(146);
    const sizes = await cards.evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect();
        return { width: r.width, top: r.top };
      }),
    );
    expect(sizes[0].top).toBe(sizes[1].top);
    expect(sizes[0].width).toBeLessThanOrEqual(sizes[1].width + 2);
    expect(
      await cards.evaluateAll((els) =>
        els.every((el) => {
          const r = el.getBoundingClientRect(),
            board = el.closest(".table")!.getBoundingClientRect();
          return r.left >= board.left && r.right <= board.right;
        }),
      ),
    ).toBe(true);
    expect(
      await cards.locator(".tile").evaluateAll((els) =>
        els.every((el) => {
          const r = el.getBoundingClientRect(),
            card = el.closest(".meld")!.getBoundingClientRect();
          return r.width >= 44 && r.left >= card.left && r.right <= card.right;
        }),
      ),
    ).toBe(true);
    expect(
      await cards.locator(".meld-actions button").evaluateAll((els) =>
        els.every((el) => {
          const r = el.getBoundingClientRect(),
            card = el.closest(".meld")!.getBoundingClientRect();
          return (
            r.width >= 44 &&
            r.height >= 44 &&
            r.left >= card.left &&
            r.right <= card.right
          );
        }),
      ),
    ).toBe(true);
    // Check native metrics and wider text; keep diagnostics for CI font differences.
    for (const textSize of [null, "20px"]) {
      await cards.locator(".inspect-meld").evaluateAll(
        (els, size) =>
          els.forEach((el) => {
            if (size) (el as HTMLElement).style.fontSize = size;
            else (el as HTMLElement).style.removeProperty("font-size");
          }),
        textSize,
      );
      const metrics = await cards.locator(".inspect-meld").evaluateAll((els) =>
        els.map((el) => {
          const r = el.getBoundingClientRect(),
            card = el.closest(".meld")!.getBoundingClientRect(),
            range = document.createRange();
          range.selectNodeContents(el);
          const text = range.getBoundingClientRect();
          return {
            font: getComputedStyle(el).font,
            width: r.width,
            textWidth: text.width,
            scroll: el.scrollWidth,
            client: el.clientWidth,
            fits:
              r.width >= 44 &&
              r.height >= 44 &&
              r.left >= card.left &&
              r.right <= card.right &&
              text.left >= r.left &&
              text.right <= r.right &&
              el.scrollWidth <= el.clientWidth,
          };
        }),
      );
      expect(
        metrics.filter((m) => !m.fits),
        JSON.stringify({ width, textSize, metrics }),
      ).toEqual([]);
    }
    await cards
      .locator(".inspect-meld")
      .evaluateAll((els) =>
        els.forEach((el) =>
          (el as HTMLElement).style.removeProperty("font-size"),
        ),
      );
    expect(await save()).toBe(before);
    expect(
      await cards.evaluateAll((els) =>
        els.map((el) => el.getAttribute("data-meld-id")),
      ),
    ).toEqual(order);
    if (width === 1180)
      await cards.nth(1).screenshot({
        path: `/tmp/runset-footer-closeup-${info.project.name || "chromium"}-${locale}.png`,
      });
    await page.screenshot({
      path: `/tmp/runset-meld-space-${info.project.name || "chromium"}-${locale}-${width}.png`,
    });
  }
  await activate(page.locator('main.game .table [data-tile-id="25"]'));
  await activate(page.locator('main.game .table [data-tile-id="25"]'));
  // The original rack selection survives long-run navigation and rotation.

  const destination = button("Add selected tiles to meld 8");
  await expect(destination).toHaveAttribute(
    "data-suggested-destination",
    "true",
  );
  // Inspect the actual keyboard focus ring separately from the destination cue.
  await page.keyboard.press("Tab");
  await destination.focus();
  await expect(destination).toBeFocused();
  expect(
    await destination.evaluate((el) => getComputedStyle(el).outlineStyle),
  ).toBe("solid");
  await destination.evaluate((el) => el.blur());
  expect(
    await destination.evaluate((el) => getComputedStyle(el).outlineStyle),
  ).toBe("dashed");
  expect(await save()).toBe(before);
  await activate(button("Add selected tiles to meld 8"));
  await expect
    .poll(async () => JSON.parse((await save())!).history.length)
    .toBe(2);
  expect(JSON.parse((await save())!).table.at(-1).tiles).toEqual([3, 4, 5]);
  await activate(button("Undo move"));
  await expect
    .poll(async () => JSON.parse((await save())!).table)
    .toEqual(game.table);
  const undone = await save();
  expect(
    (await new AxeBuilder({ page }).include("main.game").analyze()).violations,
  ).toEqual([]);
  await page.evaluate(() => localStorage.setItem("runset.reading", "true"));
  await page.reload();
  await activate(button("Continue game →"));
  await chooseView(page, "table", t);
  await page.setViewportSize({ width: 375, height: 667 });
  expect(
    await cards.first().evaluate((el) => el.getBoundingClientRect().width),
  ).toBeGreaterThanOrEqual(198);
  expect(
    await cards
      .locator(".tile")
      .first()
      .evaluate((el) => {
        const r = el.getBoundingClientRect();
        return r.width === 58 && r.height === 80;
      }),
  ).toBe(true);
  expect(await save()).toBe(undone);
  await page.screenshot({
    path: `/tmp/runset-meld-space-${info.project.name || "chromium"}-${locale}-comfortable.png`,
  });
  expect(errors).toEqual([]);
}
