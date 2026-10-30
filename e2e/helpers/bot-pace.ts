import { expect, type Page, type BrowserContext, type TestInfo, type Locator } from "@playwright/test";
import { practiceGame } from "../../src/engine/practice";
import { validSave } from "../../src/lib/storage";
import { translator } from "../../src/i18n/translate";
import messages from "../../src/i18n/zh-CN";

/** Observe native workers; never replace planning or supply a synthetic response. */
export async function verifyBotPace(page: Page, context: BrowserContext, info: TestInfo, locale: "en" | "zh-CN", offline: boolean) {
  const t = locale === "en" ? (s: string) => s : translator(messages);
  const game = practiceGame(), now=Date.now(), opening=[9,35,61], rack=[10,36,62,25];
  game.current=0; game.coach=false; game.table=[{id:"opening",tiles:opening}];
  game.players[0].rack=[12];
  game.players[1].bot="easy"; game.players[1].melded=false; game.players[1].rack=rack;
  const rest=Array.from({length:106},(_,i)=>i).filter(id=>![...opening,12,...rack].includes(id));
  game.pool=rest;
  game.turnStart={table:[],rack:[...opening,12]};
  game.history=[structuredClone(game.turnStart)];
  game.turnSeconds=120; game.deadline=now+120000;
  expect(validSave(game)).toBe(true);
  await page.clock.install({time:now});
  await page.emulateMedia({reducedMotion:"reduce",colorScheme:locale==="en"?"light":"dark"});
  await page.addInitScript(({game,locale})=>{
    const observed=window as typeof window & {__paceStarts:number};
    observed.__paceStarts=0;
    const NativeWorker=window.Worker;
    window.Worker=class extends NativeWorker {
      constructor(url:string|URL,options?:WorkerOptions) {super(url,options);observed.__paceStarts++;}
    };
    if (sessionStorage.getItem("bot-pace-seed")) return;
    sessionStorage.setItem("bot-pace-seed","1");
    localStorage.setItem("runset.save.v1",JSON.stringify(game));
    localStorage.setItem("runset.language",locale);
    localStorage.setItem("runset.reading",String(locale==="zh-CN"));
    localStorage.setItem("runset.muted","true");
  },{game,locale});
  const errors:string[]=[];
  page.on("pageerror",error=>errors.push(error.message));
  const b=(name:string)=>page.getByRole("button",{name:t(name),exact:true});
  const bytes=()=>page.evaluate(()=>localStorage.getItem("runset.save.v1"));
  const starts=()=>page.evaluate(()=>(window as typeof window & {__paceStarts:number}).__paceStarts);
  const activate=async(el:Locator)=>{
    await el.scrollIntoViewIfNeeded();
    expect(await el.evaluate(el=>{const r=el.getBoundingClientRect();return r.width>=44&&r.height>=44&&r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth&&el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));})).toBe(true);
    if(info.project.name==="firefox-desktop") await el.click(); else await el.tap();
  };
  await page.goto("/");
  if(offline){
    await expect(page.getByRole("status").filter({hasText:t("Ready offline")})).toBeVisible();
    await context.setOffline(true); await page.reload();
  }
  for(const pace of [1400,700,2400,5000]){
    if(pace!==1400){
      await page.clock.resume();
      await page.evaluate(game=>localStorage.setItem("runset.save.v1",JSON.stringify(game)),game);
      await page.reload();
    }
    await activate(b("Continue game →"));
    await expect(page.locator(".save-indicator")).toHaveText(t("Saved"));
    await activate(b("Settings"));
    const setting=page.getByLabel(t("Opponent pace"),{exact:true});
    if(pace===1400) await expect(setting).toHaveValue("1400");
    await setting.selectOption(String(pace));
    await page.clock.pauseAt(new Date(await page.evaluate(()=>Date.now()+1000)));
    await activate(page.getByRole("dialog").getByRole("button",{name:t("Done"),exact:true}).first());
    await activate(page.locator(".primary-actions > button.primary"));
    await expect.poll(async()=>JSON.parse((await bytes())!).turn).toBe(2);
    await expect(page.locator(".save-indicator")).toHaveText(t("Saved"));
    const waiting=await bytes();
    expect(await starts()).toBe(0);
    if(pace===5000){
      await page.clock.runFor(2500);
      expect(await starts()).toBe(0);
      await activate(b("Settings"));
      await page.clock.runFor(5000);
      expect(await starts()).toBe(0);
      expect(await bytes()).toBe(waiting);
      await activate(page.getByRole("dialog").getByRole("button",{name:t("Done"),exact:true}).first());
    }
    await page.clock.runFor(pace-1);
    expect(await starts()).toBe(0);
    expect(await bytes()).toBe(waiting);
    await page.clock.runFor(1);
    await expect.poll(starts).toBe(1);
    await expect.poll(async()=>JSON.parse((await bytes())!).turn).toBe(3);
    const after=JSON.parse((await bytes())!);
    expect(after.table).toEqual([...game.table,{id:"bot-2-0",tiles:[10,36,62]}]);
    expect(after.players[1].rack).toEqual([25]);
    expect(after.players[1].melded).toBe(true);
    expect(after.players[1].bot).toBe("easy");
    expect(after.turnSeconds).toBe(game.turnSeconds);
    expect(after.players[0].rack).toEqual(game.players[0].rack);
    expect(after.lastPlaced).toEqual([10,36,62]);
    expect(validSave(after)).toBe(true);
    expect(await starts()).toBe(1);
    expect(await page.evaluate(()=>localStorage.getItem("runset.pace"))).toBe(String(pace));
  }
  const selected=page.locator('.rack [data-tile-id="12"]');
  await activate(selected);
  const beforeHelp=await bytes();
  const menu=page.locator(".more-actions");
  await activate(menu.locator(":scope > summary"));
  const guide=page.locator(".opponent-guide");
  await activate(guide.locator(":scope > summary"));
  const copy=guide.getByText(t("Easy may draw repeatedly while waiting for a new group or run. After opening, Normal can also add single tiles to the table."),{exact:true});
  await copy.scrollIntoViewIfNeeded();
  expect(await copy.evaluate(el=>{const r=el.getBoundingClientRect(),m=el.closest(".more-actions > div")!.getBoundingClientRect();return r.top>=Math.max(0,m.top)&&r.bottom<=Math.min(innerHeight,m.bottom)&&r.left>=0&&r.right<=innerWidth;})).toBe(true);
  if(locale==="zh-CN") expect(await copy.innerText()).not.toMatch(/[a-z]/i);
  await page.screenshot({path:`/tmp/runset-bot-pace-${info.project.name||"chromium"}-${locale}.png`});
  await activate(guide.locator(":scope > summary"));
  await activate(menu.locator(":scope > summary"));
  await expect(selected).toHaveAttribute("aria-pressed","true");
  expect(await bytes()).toBe(beforeHelp);
  expect(await starts()).toBe(1);
  expect(errors).toEqual([]);
}
