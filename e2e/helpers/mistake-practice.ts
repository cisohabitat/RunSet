import { expect, type Page, type BrowserContext, type TestInfo, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { landscapePosition } from "./landscape";
import { practiceGame } from "../../src/engine/practice";
import { exerciseGame } from "../../src/engine/exercises";
import { reducer, turnCheck, type GameState } from "../../src/engine/game";
import { validSave } from "../../src/lib/storage";
import { freshTurnPractice } from "../../src/lib/turnPractice";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";

export type MistakeCase = "opening" | "repair" | "joker";
export async function verifyMistakePractice(page: Page, context: BrowserContext, info: TestInfo, locale: "en" | "zh-CN", scenario: MistakeCase, offline: boolean) {
  const t = locale === "en" ? (s: string) => s : translator(messages), now = Date.now();
  let source = scenario === "joker" ? practiceGame("jokers") : landscapePosition();
  delete source.match;
  source.coach = false;
  source.turnSeconds = 120;
  source.deadline = now + 120000;
  if (scenario === "opening") source.players[0].melded = false;
  if (scenario === "repair") source = reducer(source, {type:"move",ids:[3,4],target:"new"});
  if (scenario === "joker") source = reducer(source, {type:"move",ids:[104],target:"new"});
  expect(validSave(source)).toBe(true);
  await page.clock.install({time:now});
  await page.clock.setFixedTime(now);
  await page.emulateMedia({reducedMotion:"reduce",colorScheme:locale === "en" ? "light" : "dark"});
  await page.addInitScript(({source,locale,lesson,exercise,wholeTurn}) => {
    if (sessionStorage.getItem("mistake-practice-seeded")) return;
    sessionStorage.setItem("mistake-practice-seeded","1");
    localStorage.setItem("runset.save.v1",JSON.stringify(source));
    localStorage.setItem("runset.language",locale);
    localStorage.setItem("runset.reading",String(locale === "zh-CN"));
    localStorage.setItem("runset.muted","true");
    localStorage.setItem("runset.practice.v1",JSON.stringify(lesson));
    localStorage.setItem("runset.exercises.v1",JSON.stringify(exercise));
    localStorage.setItem("runset.turnPractice.v1",JSON.stringify(wholeTurn));
  },{source,locale,lesson:{lesson:"basics",step:0,game:practiceGame()},exercise:{version:1,kind:"extend",game:exerciseGame("extend",4321),checked:false},wholeTurn:freshTurnPractice("quiet").record});
  const errors: string[] = [];
  page.on("pageerror",e=>errors.push(e.message));
  const b = (name: string) => page.getByRole("button",{name:t(name),exact:true});
  const targetReady = async (el: Locator) => {
    const geometry = () => el.evaluate(el => {
      const r=el.getBoundingClientRect(), clip=el.closest(".hint-preview-body,.position-practice-body")?.getBoundingClientRect();
      return {valid:r.width>=44&&r.height>=44&&r.left>=0&&r.right<=innerWidth&&r.top>=Math.max(0,clip?.top??0)&&r.bottom<=Math.min(innerHeight,clip?.bottom??innerHeight)&&el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)),rect:r.toJSON(),clip:clip?.toJSON(),label:el.textContent};
    });
    try { await expect.poll(geometry).toMatchObject({valid:true}); }
    catch(error) { console.log("MISTAKE_PRACTICE_TARGET "+JSON.stringify(await geometry())); throw error; }
  };
  const activate = async (el: Locator) => {
    await el.scrollIntoViewIfNeeded();
    await targetReady(el);
    if (info.project.name === "firefox-desktop") await el.click(); else await el.tap();
  };
  const bytes = () => page.evaluate(()=>localStorage.getItem("runset.save.v1"));
  const keys = () => page.evaluate(()=>Object.fromEntries(Object.keys(localStorage).sort().map(k=>[k,localStorage.getItem(k)])));
  const saved = async (expected: GameState) => {
    await expect.poll(async()=>JSON.parse((await bytes())!)).toEqual(expected);
    await expect(page.locator(".save-indicator")).toHaveText(t("Saved"));
  };
  await page.goto("/");
  if (offline) {
    await expect(page.getByRole("status").filter({hasText:t("Ready offline")})).toBeVisible();
    await context.setOffline(true);
    await page.reload();
  }
  await activate(b("Continue game →"));
  await expect(page.locator("main.game")).toBeVisible();
  if (scenario === "opening") {
    await activate(page.locator('main.game .rack [data-tile-id="3"]'));
    await activate(page.locator("main.game .meld-target").first());
    source = reducer(source,{type:"move",ids:[3],target:"red-run"});
  } else {
    await activate(page.locator('main.game .rack [data-tile-id="12"]'));
  }
  await saved(source);
  const selected = scenario === "opening" ? "3" : "12";
  const before = await keys(), regularBytes = await bytes();
  const more = page.locator("main.game .more-actions");
  await activate(more.locator(":scope > summary"));
  const opener = b("Why this move?");
  await activate(opener);
  const help = page.getByRole("dialog",{name:t("Move help"),exact:true});
  const copy = page.getByRole("dialog",{name:t("Practise this position"),exact:true});
  await expect(copy).toHaveCount(0);
  const reason = scenario === "opening" ? "Your opening meld must come entirely from your rack."
    : scenario === "joker" ? "Replace a joker with its represented rack tile, then reuse it this turn."
      : "Add 1 more tile: a group or run needs at least three.";
  const next = scenario === "opening" ? "Choose New group or run for your opening."
    : scenario === "joker" ? "Use Reset to restore the joker, then replace it with the matching rack tile."
      : "Add red 6 from your rack to group/run 7.";
  await expect(help).toContainText(t(next));
  expect((await new AxeBuilder({page}).include(".move-help").analyze()).violations).toEqual([]);
  const enterCopy = async () => {
    const entry = help.getByRole("button",{name:t("Practise this correction"),exact:true});
    if (scenario === "repair") {
      for (let n=0;n<10 && !(await entry.evaluate(el=>el===document.activeElement));n++)
        await page.keyboard.press("Shift+Tab");
      await expect(entry).toBeFocused();
      await targetReady(entry);
      await page.keyboard.press("Enter");
    } else await activate(entry);
    await expect(help).toHaveCount(0);
    await expect(copy).toBeVisible();
    await expect(copy.locator(".game")).toBeVisible();
    await expect(copy.locator(".rack [data-tile-id]")).toHaveCount(source.players[0].rack.length);
    await expect(page.locator("dialog[open]")).toHaveCount(1);
    await expect(copy.getByRole("button",{name:t("Return to saved game"),exact:true})).toBeFocused();
    const goal = copy.getByRole("region",{name:t("Correction to practise"),exact:true});
    await expect(goal).toContainText(t(next));
    await expect(goal).toContainText(t(reason));
    if (locale === "zh-CN") expect(await goal.innerText()).not.toMatch(/[a-z]/i);
    expect(await keys()).toEqual(before);
    return goal;
  };
  const goal = await enterCopy();
  for (const paragraph of await goal.locator("p").all()) {
    await paragraph.scrollIntoViewIfNeeded();
    await expect.poll(()=>paragraph.evaluate(el=>{
      const r=el.getBoundingClientRect(),body=el.closest(".position-practice-body")!.getBoundingClientRect();
      return r.top>=Math.max(0,body.top)&&r.bottom<=Math.min(innerHeight,body.bottom)&&r.left>=body.left&&r.right<=body.right;
    })).toBe(true);
  }
  const originalRack = source.players[0].rack.map(String).sort();
  expect(await copy.locator(".rack [data-tile-id]").evaluateAll(els=>els.map(el=>el.getAttribute("data-tile-id")!).sort())).toEqual(originalRack);
  expect(await copy.locator(".table .meld .tile").evaluateAll(els=>els.map(el=>Number(el.getAttribute("data-tile-id"))).sort((a,b)=>a-b))).toEqual(source.table.flatMap(m=>m.tiles).sort((a,b)=>a-b));
  await goal.scrollIntoViewIfNeeded();
  await page.screenshot({path:"/tmp/runset-mistake-practice-"+(info.project.name||"chromium")+"-"+locale+"-"+scenario+".png"});
  expect((await new AxeBuilder({page}).include(".position-practice").analyze()).violations).toEqual([]);
  if (scenario === "joker") {
    const about = copy.locator(".practice-copy-about");
    await expect(about).not.toHaveAttribute("open","");
    await activate(about.locator(":scope > summary"));
    await expect(about).toHaveAttribute("open","");
    await expect(about).toContainText(t("Unfinished moves are included. Undo affects only new practice moves; Reset returns to the start of the original turn. Unseen tiles and opponents are not played here."));
    expect(await keys()).toEqual(before);
    await activate(about.locator(":scope > summary"));
  }
  const localButton = (name: string) => copy.getByRole("button",{name:t(name),exact:true});
  if (scenario === "opening") await expect(localButton("Check this turn")).toBeDisabled();
  else {
    await activate(localButton("Check this turn"));
    await expect(copy.locator(".practice-feedback")).toBeVisible();
  }
  expect(await keys()).toEqual(before);
  const move = async (ids: number[], target?: string) => {
    for (const id of ids) await activate(copy.locator('[data-tile-id="'+id+'"]'));
    await activate(target ? copy.locator('.meld[data-meld-id="'+target+'"] .meld-target') : copy.locator(".new-meld"));
  };
  if (scenario === "opening") await move([12,51,77]);
  if (scenario === "repair") await move([5],source.table.at(-1)!.id);
  if (scenario === "joker") {
    await activate(localButton("Reset turn"));
    await move([4],"practice-wild");
    await move([104,30,56]);
  }
  const expected = scenario === "opening"
    ? reducer(source,{type:"move",ids:[12,51,77],target:"new"})
    : scenario === "repair"
      ? reducer(source,{type:"move",ids:[5],target:source.table.at(-1)!.id})
      : reducer(reducer(reducer(source,{type:"resetTurn"}),{type:"move",ids:[4],target:"practice-wild"}),{type:"move",ids:[104,30,56],target:"new"});
  expect(turnCheck(expected).valid).toBe(true);
  expect(validSave(expected)).toBe(true);
  await activate(localButton("Check this turn"));
  await expect(copy.getByRole("heading",{name:t("This practice turn is valid"),exact:true})).toBeFocused();
  expect(await copy.locator(".practice-result-melds figure").evaluateAll(figures=>figures.map(figure=>Array.from(figure.querySelectorAll("[data-tile-id]")).map(el=>Number(el.getAttribute("data-tile-id"))).sort((a,b)=>a-b).join(",")).sort())).toEqual(expected.table.map(m=>[...m.tiles].sort((a,b)=>a-b).join(",")).sort());
  expect(await keys()).toEqual(before);
  await activate(localButton("Return to saved game"));
  await expect(copy).toHaveCount(0);
  await expect(opener).toBeFocused();
  await expect(page.locator('main.game [data-tile-id="'+selected+'"]')).toHaveAttribute("aria-pressed","true");
  expect(await bytes()).toBe(regularBytes);
  await activate(opener);
  await enterCopy();
  await page.keyboard.press("Escape");
  await expect(copy).toHaveCount(0);
  await expect(opener).toBeFocused();
  expect(await keys()).toEqual(before);
  if (scenario === "opening") {
    await activate(opener);
    await enterCopy();
    await page.clock.setFixedTime(now+120001);
    await expect(copy).toHaveCount(0);
    const expired = reducer(source,{type:"tick",now:now+120001});
    await expect.poll(async()=>JSON.parse((await bytes())!)).toEqual(expired);
    expect(expired.deadline).not.toBe(source.deadline);
    const afterExpiry = await keys();
    for (const key of ["runset.practice.v1","runset.exercises.v1","runset.turnPractice.v1"])
      expect(afterExpiry[key]).toBe(before[key]);
  }
  expect(errors).toEqual([]);
}
