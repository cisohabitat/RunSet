import {test,expect,type Locator} from "@playwright/test";
import {practiceGame} from "../src/engine/practice";
import {translator} from "../src/i18n/translate";
import messages from "../src/i18n/zh-CN";
import {verifyLessonActionRecovery} from "./helpers/lesson-selection";
test.use({viewport:{width:1440,height:900}});
for(const locale of ["en","zh-CN"] as const) test(`${locale}: desktop lesson corrections stay readable and keep saved games`,async({page})=>{
 const t=locale === "en"?(s:string)=>s:translator(messages);
 const errors:string[]=[];
 page.on("pageerror",error=>errors.push(error.message));
 await page.addInitScript(({locale,game})=>{
  localStorage.setItem("runset.language",locale);
  localStorage.setItem("runset.save.v1",JSON.stringify(game));
  localStorage.setItem("runset.reading",String(locale==="zh-CN"));
 },{locale,game:practiceGame("rearrange")});
 await page.emulateMedia({reducedMotion:"reduce",colorScheme:locale==="en"?"light":"dark"});
 await page.goto("/");
 const activate=async(el:Locator)=>{
  await el.scrollIntoViewIfNeeded();
  await expect.poll(()=>el.evaluate(el=>{const r=el.getBoundingClientRect();return r.width>=44&&r.height>=44&&r.top>=0&&r.bottom<=innerHeight&&r.left>=0&&r.right<=innerWidth&&el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));})).toBe(true);
  await el.click();
 };
 const b=(s:string)=>page.getByRole("button",{name:t(s),exact:true});
 await activate(page.getByRole("button",{name:new RegExp(t("Learn to play"))}));
 const place=async(ids:number[])=>{for(const id of ids)await activate(page.locator(`.rack [data-tile-id="${id}"]`));await activate(page.locator(".new-meld"));};
 await place([9,35,61]);await place([0,1,2]);
 await verifyLessonActionRecovery(page,t,activate,"I see: 30 + 6 = 36 →");
 await activate(b("I see: 30 + 6 = 36 →"));
 await expect(page.locator(".practice-feedback")).toHaveCount(0);
 await expect.poll(()=>page.locator("#practice-instructions").evaluate(el=>{
  const r=el.getBoundingClientRect(),clip=el.closest(".practice-copy")!.getBoundingClientRect();
  return r.top>=clip.top&&r.bottom<=clip.bottom;
 })).toBe(true);
 await verifyLessonActionRecovery(page,t,activate,"End turn →");
 await activate(b("End turn →"));await activate(b("Watch Juniper draw →"));
 await verifyLessonActionRecovery(page,t,activate,"Draw a tile");
 await activate(page.getByRole("button",{name:new RegExp(t("Draw a tile"))}));
 await place([12]);await verifyLessonActionRecovery(page,t,activate,"Reset",25);
 await activate(b("Reset turn"));
 await expect(page.locator(".practice-panel h1")).toHaveText(t("You know the basics"));
 expect(errors).toEqual([]);
});
