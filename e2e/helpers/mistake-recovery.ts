import { expect, type Page, type BrowserContext, type TestInfo, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { practiceGame } from "../../src/engine/practice";
import { reducer, type GameState } from "../../src/engine/game";
import { validSave } from "../../src/lib/storage";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";

export async function verifyMistakeRecovery(page: Page, context: BrowserContext, info: TestInfo, locale: "en" | "zh-CN", offline: boolean) {
  const t = locale === "en" ? (s: string) => s : translator(messages);
  const base = practiceGame("jokers"), extra = [9,35,105], now = Date.now();
  for (const p of base.players) p.rack = p.rack.filter(id => !extra.includes(id));
  base.pool = base.pool.filter(id => !extra.includes(id));
  base.table.push({id:"second-wild",tiles:extra});
  base.turnStart.table = structuredClone(base.table);
  base.coach = false;
  base.turnSeconds = 120;
  base.deadline = now + 120000;
  expect(validSave(base)).toBe(true);
  await page.clock.install({time:now});
  await page.clock.setFixedTime(now);
  await page.emulateMedia({reducedMotion:"reduce",colorScheme:locale === "en" ? "light" : "dark"});
  await page.addInitScript(({base,locale}) => {
    if (sessionStorage.getItem("mistake-recovery-seed")) return;
    sessionStorage.setItem("mistake-recovery-seed","1");
    localStorage.setItem("runset.save.v1", JSON.stringify(base));
    localStorage.setItem("runset.language", locale);
    localStorage.setItem("runset.reading",String(locale === "zh-CN"));
    localStorage.setItem("runset.muted","true");
  }, {base,locale});
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  const b = (name: string) => page.getByRole("button", {name:t(name),exact:true});
  const bytes = () => page.evaluate(() => localStorage.getItem("runset.save.v1"));
  const activate = async (el: Locator) => {
    await el.scrollIntoViewIfNeeded();
    const geometry = await el.evaluate(el => {
      const r = el.getBoundingClientRect();
      return {valid:r.width>=44&&r.height>=44&&r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth&&el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)),rect:r.toJSON()};
    });
    expect(geometry).toMatchObject({valid:true});
    if (info.project.name === "firefox-desktop") await el.click(); else await el.tap();
  };
  const menu = page.locator(".more-actions");
  const panel = page.getByRole("dialog",{name:t("Move help"),exact:true});
  const resume = async () => activate(b("Continue game →"));
  const openHelp = async () => {
    if (!(await menu.evaluate((el: HTMLDetailsElement) => el.open))) await activate(menu.locator(":scope > summary"));
    await expect(menu).toHaveAttribute("open", "");
    await activate(b("Why this move?"));
    await expect(panel).toBeVisible();
  };
  const saved = async (expected: GameState) => {
    await expect.poll(async () => JSON.parse((await bytes())!)).toEqual(expected);
    await expect(page.locator(".save-indicator")).toHaveText(t("Saved"));
    return (await bytes())!;
  };
  const move = async (id: number, target = "new") => {
    await activate(page.locator(`.table [data-tile-id="${id}"],.rack [data-tile-id="${id}"]`));
    await activate(target === "new" ? page.locator(".new-meld") : b("Add selected tiles to meld 1"));
  };
  const selection = () => page.locator(".table .tile[aria-pressed=true],.rack .tile[aria-pressed=true]").evaluateAll(els => els.map(el => el.getAttribute("data-tile-id")));
  const findAction = async (name: "Undo" | "Reset", checkpoint: string) => {
    const selected = await selection();
    await activate(panel.getByRole("button",{name:t(`Find ${name}`),exact:true}));
    await expect(panel).not.toBeVisible();
    await expect(menu).not.toHaveAttribute("open", "");
    const action = b(name === "Undo" ? "Undo move" : "Reset turn");
    await expect(action).toBeFocused();
    // Finding a control is read-only. Only its subsequent native activation acts.
    expect(await bytes()).toBe(checkpoint);
    expect(await selection()).toEqual(selected);
    await activate(action);
  };
  await page.goto("/");
  if (offline) {
    await expect(page.getByRole("status").filter({hasText:t("Ready offline")})).toBeVisible();
    await context.setOffline(true);
    await page.reload();
  }
  await resume();
  await move(105);
  const draft = reducer(base,{type:"move",ids:[105],target:"new"});
  const checkpoint = await saved(draft);
  await activate(page.locator('.rack [data-tile-id="12"]'));
  await openHelp();
  await expect(panel.getByRole("region",{name:t("Tiles in this move"),exact:true}).locator(".tile")).toHaveAttribute("data-tile-id","105");
  await expect(panel).toContainText(t("Undo takes back one move. Reset restores this whole turn without a penalty."));
  for (const name of ["Find affected tiles","Find Undo","Find Reset","Back to table"]) {
    const control = panel.getByRole("button",{name:t(name),exact:true});
    await control.scrollIntoViewIfNeeded();
    expect(await control.evaluate(el => {const r=el.getBoundingClientRect();return r.width>=(innerWidth<=540 ? 120 : 44)&&r.height>=44&&r.top>=0&&r.bottom<=innerHeight&&el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));})).toBe(true);
  }
  const explanation = panel.getByRole("region",{name:t("Move explanation"),exact:true});
  for (const paragraph of await explanation.locator("p").all()) {
    await paragraph.scrollIntoViewIfNeeded();
    const geometry = await paragraph.evaluate(el => {const r=el.getBoundingClientRect(),b=el.closest(".hint-preview-body")!.getBoundingClientRect();return {valid:r.top>=Math.max(0,b.top)&&r.bottom<=Math.min(innerHeight,b.bottom),text:el.textContent,rect:r.toJSON(),bounds:b.toJSON()};});
    expect(geometry.valid, JSON.stringify(geometry)).toBe(true);
  }
  if (locale === "zh-CN") expect(await explanation.innerText()).not.toMatch(/[a-z]/i);
  expect((await new AxeBuilder({page}).include(".move-help").analyze()).violations).toEqual([]);
  await page.screenshot({path:`/tmp/runset-mistake-recovery-${info.project.name||"chromium"}-${locale}.png`});
  expect(await bytes()).toBe(checkpoint);
  await activate(panel.getByRole("button",{name:t("Find affected tiles"),exact:true}));
  await expect(page.locator('.table [data-tile-id="105"]')).toBeFocused();
  expect(await selection()).toEqual(["12"]);
  expect(await bytes()).toBe(checkpoint);
  await openHelp();
  await findAction("Undo",checkpoint);
  await saved(reducer(draft,{type:"undo"}));
  await move(4,"practice-wild");
  await move(105);
  const twoMoves = reducer(reducer(reducer(draft,{type:"undo"}),{type:"move",ids:[4],target:"practice-wild"}),{type:"move",ids:[105],target:"new"});
  const twoBytes = await saved(twoMoves);
  expect(twoMoves.history).toHaveLength(2);
  await openHelp();
  await findAction("Reset",twoBytes);
  await saved(reducer(twoMoves,{type:"resetTurn"}));

  // A legacy draft without Undo history still offers the actual penalty-free Reset.
  const legacy = structuredClone(draft);
  delete legacy.history;
  expect(validSave(legacy)).toBe(true);
  await page.evaluate(legacy => localStorage.setItem("runset.save.v1",JSON.stringify(legacy)),legacy);
  await page.reload(); await resume();
  const legacyBytes = await bytes();
  await openHelp();
  await expect(panel.getByRole("button",{name:t("Find Undo"),exact:true})).toHaveCount(0);
  await expect(panel).toContainText(t("Reset restores this whole turn without a penalty."));
  await findAction("Reset",legacyBytes!);
  await saved(reducer(legacy,{type:"resetTurn"}));

  // Follow the blocked-opening advice literally, keeping rejected selections until Clear.
  const unopened = structuredClone(base);
  unopened.players[0].melded = false;
  await page.evaluate(game => localStorage.setItem("runset.save.v1",JSON.stringify(game)),unopened);
  await page.reload(); await resume();
  await move(3);
  await openHelp();
  await expect(panel).toContainText(t("Clear selection, then choose only rack tiles for your opening."));
  await expect(panel.getByRole("button",{name:t("Find Undo"),exact:true})).toHaveCount(0);
  await expect(panel.getByRole("button",{name:t("Find Reset"),exact:true})).toBeEnabled();
  await activate(panel.getByRole("button",{name:t("Back to table"),exact:true}));
  await activate(menu.locator(":scope > summary"));
  await activate(b("Deselect all"));
  for (const id of [30,56,82]) await activate(page.locator(`.rack [data-tile-id="${id}"]`));
  await activate(page.locator(".new-meld"));
  const corrected = reducer(unopened,{type:"move",ids:[30,56,82],target:"new"});
  const correctedBytes = await saved(corrected);
  await openHelp();
  await expect(panel).toContainText(t("Add at least 15 more opening points using tiles from your rack."));
  await findAction("Reset",correctedBytes);
  const final = reducer(corrected,{type:"resetTurn"});
  await saved(final);
  expect(final.deadline).toBe(base.deadline);
  expect(final.players[0].rack).toEqual(unopened.players[0].rack);
  expect(validSave(final)).toBe(true);
  expect(errors).toEqual([]);
}
