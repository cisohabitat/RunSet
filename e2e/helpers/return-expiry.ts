import {expect, type Page, type BrowserContext, type TestInfo, type Locator} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {landscapePosition} from "./landscape";
import {reducer} from "../../src/engine/game";
import {validSave} from "../../src/lib/storage";
import {translator} from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";

export async function verifyReturnExpiry(page: Page, context: BrowserContext, info: TestInfo, locale: "en" | "zh-CN", offline: boolean) {
  const t = locale === "en" ? (s:string) => s : translator(messages);
  const now = Date.now(), week = 7 * 86400000;
  const original = landscapePosition();
  delete original.match;
  original.coach = false;
  original.deadline = now + 120000;
  original.players[0].name = "阿明";
  if (locale === "zh-CN") original.passes = 1;
  original.players[1].rack.push(...original.pool.splice(0));
  const draft = reducer(original, {type:"move", ids:[3,4], target:"new"});
  // Imported/older valid saves can retain a draft without any Undo snapshots.
  if (locale === "en") delete draft.history;
  else draft.history = [];
  expect(validSave(draft)).toBe(true);
  await page.clock.install({time:now});
  await page.clock.setFixedTime(now);
  await page.emulateMedia({reducedMotion:"reduce",colorScheme:locale === "en" ? "light" : "dark"});
  await page.addInitScript(({draft,locale}) => {
    if(sessionStorage.getItem("return-expiry-seeded")) return;
    sessionStorage.setItem("return-expiry-seeded","1");
    localStorage.setItem("runset.save.v1",JSON.stringify(draft));
    localStorage.setItem("runset.language",locale);
    localStorage.setItem("runset.pace","5000");
    localStorage.setItem("runset.reading",String(locale === "zh-CN"));
    localStorage.setItem("runset.simpleHome",String(locale === "zh-CN"));
  },{draft,locale});
  const errors:string[]=[];
  page.on("pageerror", e => errors.push(e.message));
  const saved = () => page.evaluate(() => localStorage.getItem("runset.save.v1"));
  const state = async () => JSON.parse((await saved())!);
  const b = (name:string) => page.getByRole("button",{name:t(name),exact:true});
  const activate = async (el:Locator) => {
    await el.scrollIntoViewIfNeeded();
    await expect.poll(() => el.evaluate(el => {
      const r = el.getBoundingClientRect();
      return r.width >= 44 && r.height >= 44 && r.left >= 0 && r.right <= innerWidth
        && r.top >= 0 && r.bottom <= innerHeight
        && el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));
    })).toBe(true);
    if(info.project.name === "firefox-desktop") await el.click(); else await el.tap();
  };
  await page.goto("/");
  if(offline) {
    await expect(page.getByRole("status").filter({hasText:t("Ready offline")})).toBeVisible();
    await context.setOffline(true);
    await page.reload();
  }
  const guide = page.locator(".resume-context");
  await expect(guide).toContainText(t("After continuing, Reset restores this turn without a penalty."));
  await expect(guide).not.toContainText(t("After continuing, Undo takes back one move. Reset restores this turn without a penalty."));
  expect(await state()).toEqual(draft);
  await activate(b("Continue game →"));
  await expect(page.locator(".save-indicator")).toHaveText(t("Saved"));
  await expect(b("Undo move")).toBeDisabled();
  await activate(b("Reset turn"));
  await expect.poll(state).toEqual(reducer(draft,{type:"resetTurn"}));
  await activate(page.locator('.rack [data-tile-id="3"]'));
  await activate(b("Add selected tiles to meld 1"));
  await expect.poll(state).toEqual(reducer(reducer(draft,{type:"resetTurn"}),{type:"move",ids:[3],target:"red-run"}));
  await expect(page.locator(".save-indicator")).toHaveText(t("Saved"));
  const ready = await saved();
  await activate(page.locator(".site-header").getByRole("button",{name:t("Home"),exact:true}));
  await expect(guide).toContainText(t("Ready: choose End turn to keep this play."));
  await page.clock.setFixedTime(now + week);
  await page.clock.runFor(1001);
  await expect(guide).toContainText(t("Time has run out for this turn. Continuing resets unfinished edits and passes without drawing a tile."));
  await expect(guide).not.toContainText(t("Ready: choose End turn to keep this play."));
  await expect(guide).not.toContainText(t("After continuing, Undo takes back one move. Reset restores this turn without a penalty."));
  expect(await saved()).toBe(ready);
  const viewport = page.viewportSize()!;
  for(const size of [{width:320,height:640},{width:1180,height:820},{width:1440,height:900}]) {
    await page.setViewportSize(size);
    expect(await guide.evaluate(el => {
      const r = el.getBoundingClientRect();
      return r.left >= 0 && r.right <= innerWidth;
    })).toBe(true);
    expect(await saved()).toBe(ready);
  }
  await page.setViewportSize(viewport);
  expect((await new AxeBuilder({page}).include(".save-summary").analyze()).violations).toEqual([]);
  await guide.scrollIntoViewIfNeeded();
  await page.screenshot({path:`/tmp/runset-return-expiry-${info.project.name||"chromium"}-${locale}.png`});
  await activate(b("Continue game →"));
  if (locale === "zh-CN") {
    await expect.poll(async () => (await state()).phase).toBe("over");
    await expect(page.locator(".game-over")).toBeVisible();
  } else await expect.poll(async () => (await state()).turn).toBe(original.turn + 1);
  const expired = await state();
  expect(expired.current).toBe(locale === "zh-CN" ? 0 : 1);
  expect(expired.turn).toBe(original.turn + (locale === "zh-CN" ? 0 : 1));
  expect(expired.passes).toBe(original.passes + 1);
  expect(expired.log.length).toBe(original.log.length + 1);
  expect(expired.table).toEqual(original.turnStart.table);
  expect(expired.players[0].rack).toEqual(original.turnStart.rack);
  expect(expired.pool).toEqual([]);
  expect(expired.history).toEqual([]);
  expect(validSave(expired)).toBe(true);
  expect(errors).toEqual([]);
  console.log("RETURN_EXPIRY "+JSON.stringify({locale,browser:info.project.name||"chromium",weekAway:true,emptyPoolPass:true,blockedRoundFinished:locale === "zh-CN",resetWithoutUndo:true,readOnlyHome:true,physicalDevice:false}));
}
