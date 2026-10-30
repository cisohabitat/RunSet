import { verifyTileMarkings } from "./tile-markings";
import { expect, type Page, type BrowserContext, type TestInfo, type Locator } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { landscapePosition } from "./landscape";
import { emitVisual } from "./ci-visual";
import { validSave } from "../../src/lib/storage";
import { exportBackup } from "../../src/lib/backup";
import { results, reducer, type GameState } from "../../src/engine/game";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";

/** A normal first deal and resumable edit, followed by an explicitly constructed ending control. */
export async function verifyReleaseConsolidation(page: Page, context: BrowserContext, info: TestInfo, locale: "en" | "zh-CN", offline: boolean) {
  const t = locale === "en" ? (s: string) => s : translator(messages);
  const originalViewport = page.viewportSize()!;
  const errors: string[] = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.emulateMedia({reducedMotion:"reduce",colorScheme:locale==="en"?"light":"dark"});
  await page.addInitScript(locale => {
    if(sessionStorage.getItem("release-preferences")) return;
    sessionStorage.setItem("release-preferences","1");
    localStorage.setItem("runset.language",locale);
    localStorage.setItem("runset.muted","true");
    localStorage.setItem("runset.pace","700");
    localStorage.setItem("runset.reading","false");
  },locale);
  const b = (s: string) => page.getByRole("button",{name:t(s),exact:true});
  const bytes = () => page.evaluate(()=>localStorage.getItem("runset.save.v1"));
  const state = async (): Promise<GameState> => JSON.parse((await bytes())!);
  const activate = async (el: Locator) => {
    await el.scrollIntoViewIfNeeded();
    const measure=()=>el.evaluate(el=>{
      const r=el.getBoundingClientRect();
      return {valid:r.width>=44&&r.height>=44&&r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight&&el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)),rect:r.toJSON(),viewport:[innerWidth,innerHeight],label:el.getAttribute("aria-label")||el.textContent?.trim().slice(0,80)};
    });
    try{await expect.poll(measure).toMatchObject({valid:true});}
    catch(error){console.log("RELEASE_ACTION_GEOMETRY "+JSON.stringify(await measure()));await emitVisual(page,info,locale,"phase4-action-failure",true);throw error;}
    if(info.project.name==="firefox-desktop") await el.click(); else await el.tap();
  };
  const header = async (stage: string, capture=false) => {
    const el=page.locator(".site-header");
    await el.scrollIntoViewIfNeeded();
    const measure=()=>el.evaluate(header=>{
      const problems: string[]=[];
      const rect=header.getBoundingClientRect();
      const controls=Array.from(header.querySelectorAll<HTMLElement>(".brand,.header-right > .language-switch select,.header-right > .game-dropdown > summary,.header-right > .sound-button,.header-right > .text-button")).filter(el=>el.getClientRects().length>0&&getComputedStyle(el).visibility!=="hidden");
      const boxes=controls.map(el=>({el,r:el.getBoundingClientRect(),name:el.getAttribute("aria-label")||el.textContent?.trim().slice(0,40)||el.tagName}));
      for(const {el,r,name} of boxes){
        if(r.width<44||r.height<44) problems.push(name+": target "+r.width+"x"+r.height);
        if(r.left<0||r.right>innerWidth||r.top<Math.max(0,rect.top)||r.bottom>Math.min(innerHeight,rect.bottom)) problems.push(name+": clipped "+JSON.stringify(r.toJSON()));
        if(!el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2))) problems.push(name+": centre covered");
      }
      for(let i=0;i<boxes.length;i++) for(let j=i+1;j<boxes.length;j++){
        const a=boxes[i].r,c=boxes[j].r;
        if(Math.min(a.right,c.right)>Math.max(a.left,c.left)&&Math.min(a.bottom,c.bottom)>Math.max(a.top,c.top)) problems.push(boxes[i].name+" overlaps "+boxes[j].name);
      }
      const brand=header.querySelector<HTMLElement>(".brand")!, br=brand.getBoundingClientRect();
      const word=brand.querySelector<HTMLElement>(".brand-word");
      const wordNodes=word ? (word.getClientRects().length ? [word] : []) : Array.from(brand.childNodes).filter(node=>node.nodeType===Node.TEXT_NODE&&node.textContent?.trim());
      for(const node of wordNodes){
        const range=document.createRange();range.selectNodeContents(node);
        const word=range.getBoundingClientRect();
        if(word.left<br.left||word.right>br.right||word.top<br.top||word.bottom>br.bottom) problems.push("Wordmark outside its button: "+JSON.stringify({word:word.toJSON(),button:br.toJSON()}));
      }
      if(document.documentElement.scrollWidth>innerWidth) problems.push("Horizontal page overflow");
      return problems;
    });
    try {await expect.poll(measure).toEqual([]);}
    catch(error) {await emitVisual(page,info,locale,"phase4-failure-"+stage,true);throw error;}
    if(capture) await emitVisual(page,info,locale,"phase4-"+stage,true);
  };
  const invariant=(s: GameState)=>{
    expect(validSave(s)).toBe(true);
    const ids=[...s.pool,...s.players.flatMap(p=>p.rack),...s.table.flatMap(m=>m.tiles)];
    expect(ids).toHaveLength(106);expect(new Set(ids).size).toBe(106);
  };
  await page.goto("/");
  if(offline){
    await expect(page.getByRole("status").filter({hasText:t("Ready offline")})).toBeVisible({timeout:15000});
    await context.setOffline(true);
    await page.reload();
  }
  expect(await bytes()).toBeNull();
  await header("fresh-home");
  await activate(page.locator(".hero-actions").getByRole("button",{name:new RegExp(t("Learn to play").trim())}));
  await expect(page.locator(".practice-panel h1")).toBeFocused();
  await header("learn");
  const place = async(ids: number[])=>{
    for(const id of ids) await activate(page.locator('.rack [data-tile-id="'+id+'"]'));
    await activate(page.locator(".new-meld"));
  };
  await place([9,35,61]);await place([0,1,2]);
  await activate(b("I see: 30 + 6 = 36 →"));
  await activate(b("End turn →"));
  await activate(b("Watch Juniper draw →"));
  await activate(page.getByRole("button",{name:new RegExp(t("Draw a tile"))}));
  await place([12]);await activate(b("Reset turn"));
  await expect(page.getByRole("heading",{name:t("You know the basics"),exact:true})).toBeVisible();
  expect(await bytes()).toBeNull();
  const lesson=await page.evaluate(()=>localStorage.getItem("runset.practice.v1"));
  await activate(b("Exit practice"));
  await activate(b("New game →"));
  await expect(page.locator(".setup")).toBeVisible();
  await header("setup");
  const name=locale==="en"?"Pat":"阿明";
  await page.getByLabel(t("What should we call you?"),{exact:true}).fill(name);
  await activate(page.getByRole("button",{name:new RegExp(t("Deal the tiles ").trim())}));
  await expect(page.locator("main.game")).toBeVisible();
  await expect.poll(async()=>!!(await state()).players[(await state()).current].bot).toBe(false);
  const deal=await state();invariant(deal);
  expect(deal.players).toHaveLength(2);
  expect(deal.players.find(p=>!p.bot)!.name).toBe(name);
  expect(deal.players.find(p=>p.bot)!.bot).toBe("easy");
  await header("playing");
  for(const view of [{width:320,height:640},{width:375,height:667},{width:820,height:1180},{width:1180,height:820}]){
    await page.setViewportSize(view);
    const headingClear = await page.locator(".game-context").evaluate(el => {
      const box = el.getBoundingClientRect(), heading = el.querySelector("h1")!.getBoundingClientRect();
      return heading.top >= box.top && heading.bottom <= box.bottom;
    });
    expect(headingClear).toBe(true);
    await header("playing-"+view.width,((info.project.name==="chromium"&&locale==="en")||(info.project.name==="webkit-phone"&&locale==="zh-CN"))&&view.width===320);
    expect((await page.locator("main.game > .table").boundingBox())!.height).toBeGreaterThanOrEqual(view.width<720?180:220);
  }
  await page.setViewportSize(originalViewport);
  const human=deal.players.find(p=>!p.bot)!;
  await activate(page.locator('.rack [data-tile-id="'+human.rack[0]+'"]'));
  await activate(page.locator(".new-meld"));
  await expect.poll(state).toEqual(reducer(deal,{type:"move",ids:[human.rack[0]],target:"new"}));
  await expect(page.locator(".save-indicator")).toHaveText(t("Saved"));
  const draft=await bytes();invariant(await state());
  await activate(page.locator(".more-actions > summary"));
  await verifyTileMarkings(page, t, activate);
  await activate(b("Take a break"));
  await expect(page.locator(".home")).toBeVisible();
  expect(await bytes()).toBe(draft);
  await header("saved-home");
  await page.reload();await activate(b("Continue game →"));
  await expect(page.locator(".save-indicator")).toHaveText(t("Saved"));
  expect(await bytes()).toBe(draft);
  await activate(b("Undo move"));
  await expect.poll(async()=>(await state()).table).toEqual(deal.table);
  expect((await state()).players.find(p=>!p.bot)!.rack).toEqual(human.rack);
  expect((await state()).pool).toEqual(deal.pool);invariant(await state());
  await activate(page.locator(".site-header").getByRole("button",{name:t("Home"),exact:true}));
  // This separate near-win import is an ending control, not a claimed full fresh-deal round.
  const ending=landscapePosition();
  delete ending.match;delete ending.turnSeconds;delete ending.deadline;
  ending.coach=false;ending.players[0].name=name;
  const keep=[3,4,5];
  ending.pool.push(...ending.players[0].rack.filter(id=>!keep.includes(id)));
  ending.players[0].rack=keep;ending.turnStart.rack=[...keep];
  invariant(ending);
  await expect(page.locator(".home")).toBeVisible();
  const saves=page.locator(".app > .save-tools");
  const [chooser]=await Promise.all([page.waitForEvent("filechooser"),activate(saves.locator(".file-button"))]);
  await chooser.setFiles({name:"release-ending-control.json",mimeType:"application/json",buffer:Buffer.from(exportBackup(ending))});
  await activate(b("Restore backup"));
  await expect.poll(state).toEqual(ending);
  await place(keep);
  await activate(b("End turn →"));
  await expect(page.locator(".game-over")).toBeVisible();
  await expect.poll(async()=>(await state()).phase).toBe("over");
  await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem("runset.roundHistory.v1")||'{"rounds":[]}').rounds.length)).toBe(1);
  const final=await bytes(), over=await state();invariant(over);
  expect(over.phase).toBe("over");
  expect(results(over).find(p=>p.winner)!.name).toBe(name);
  await expect(page.locator(".scoreboard article")).toHaveCount(2);
  const records=await page.evaluate(()=>localStorage.getItem("runset.roundHistory.v1"));
  const views=[{width:320,height:640},{width:375,height:667},{width:390,height:844},{width:820,height:1180},{width:1180,height:820},{width:1440,height:900}];
  for(const reading of [false,true]){
    await page.setViewportSize(originalViewport);
    if(reading){
      await activate(page.locator(".site-header").getByRole("button",{name:t("Settings"),exact:true}));
      const dialog=page.getByRole("dialog",{name:t("Settings"),exact:true});
      await dialog.getByRole("checkbox",{name:t("Comfortable reading"),exact:true}).check();
      await activate(dialog.getByRole("button",{name:t("Done"),exact:true}).first());
    }
    for(const view of views){
      await page.setViewportSize(view);
      const capture=((info.project.name===""||info.project.name==="chromium")&&locale==="en"&&!reading&&view.width===375)||(info.project.name==="webkit-phone"&&locale==="zh-CN"&&reading&&view.width===375)||(info.project.name==="webkit-ipad"&&view.width===1180&&reading===(locale==="zh-CN"));
      await header("results-"+view.width+"-"+(reading?"comfortable":"standard"),capture);
      expect(await bytes()).toBe(final);
    }
  }
  await page.setViewportSize(originalViewport);
  await header("final-results");
  await page.getByLabel("语言 / Language",{exact:true}).selectOption(locale==="en"?"zh-CN":"en");
  await expect(page.locator("html")).toHaveAttribute("lang",locale==="en"?"zh-CN":"en");
  expect(await bytes()).toBe(final);
  await page.getByLabel("语言 / Language",{exact:true}).selectOption(locale);
  await expect(page.locator("html")).toHaveAttribute("lang",locale);
  await activate(page.locator(".site-header").getByRole("button",{name:t("Settings"),exact:true}));
  await activate(page.getByRole("dialog",{name:t("Settings"),exact:true}).getByRole("button",{name:t("Done"),exact:true}).first());
  await expect(page.locator(".site-header").getByRole("button",{name:t("Settings"),exact:true})).toBeFocused();
  await activate(page.locator(".game-dropdown > summary"));
  await expect(page.locator(".game-menu-content")).toBeVisible();
  await activate(page.locator(".game-menu-content").getByRole("button",{name:t("Close menu"),exact:true}));
  await expect(page.locator(".game-dropdown > summary")).toBeFocused();
  await expect(page.locator(".game-menu-content")).not.toBeVisible();
  await activate(page.locator(".game-dropdown > summary"));
  await page.keyboard.press("Escape");
  await expect(page.locator(".game-menu-content")).not.toBeVisible();
  await expect(page.locator(".game-dropdown > summary")).toBeFocused();
  expect(await bytes()).toBe(final);
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem("runset.roundHistory.v1"))).toBe(records);
  expect(await page.evaluate(()=>localStorage.getItem("runset.practice.v1"))).toBe(lesson);
  expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
  expect(errors).toEqual([]);
  console.log("RELEASE_CONSOLIDATION "+JSON.stringify({locale,browser:info.project.name||"chromium",freshDeal:true,resumedDraft:true,constructedEnding:true,widths:views.map(v=>v.width),physicalDevice:false}));
}
