import {expect,type Page,type Locator,type TestInfo} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {stressPosition} from './stress';
import {reducer} from '../../src/engine/game';
import {translator} from '../../src/i18n/translate';
import messages from '../../src/i18n/zh-CN';

export async function verifyEnlargement(page:Page, info:TestInfo, locale:'en'|'zh-CN', baseURL:string, enlarge:()=>Promise<unknown>, mode:string, offline=false) {
 const t=locale==='en'?(s:string)=>s:translator(messages),initial=stressPosition();
 initial.lastPlaced=[0];
 await page.emulateMedia({reducedMotion:'reduce',colorScheme:locale==='en'?'light':'dark'});
 await page.addInitScript(({initial,locale})=>{
  localStorage.setItem('runset.save.v1',JSON.stringify(initial));
  localStorage.setItem('runset.language',locale);
  localStorage.setItem('runset.muted','true');
  localStorage.setItem('runset.reading','false');
  localStorage.setItem('runset.pace','5000');
 },{initial,locale});
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(baseURL);await expect(page.locator('.home h1')).toBeVisible();
 if(offline){
  await expect(page.getByRole('status').filter({hasText:t('Ready offline')})).toBeVisible();
  await page.context().setOffline(true);await page.reload();await expect(page.locator('.home h1')).toBeVisible();
 }
 const evidence=await enlarge();
 const bytes=()=>page.evaluate(()=>localStorage.getItem('runset.save.v1'));
 const before=await bytes();
 const b=(name:string)=>page.getByRole('button',{name:t(name),exact:true});
 const visible=async(el:Locator)=>{
  const measure=()=>el.evaluate(el=>{
   const r=el.getBoundingClientRect(),label=el instanceof HTMLInputElement&&['checkbox','radio'].includes(el.type)?el.labels?.[0]:null,target=(label??el).getBoundingClientRect(),s=getComputedStyle(el),ring=Math.max(0,parseFloat(s.outlineWidth)+parseFloat(s.outlineOffset));return {valid:target.width>=44&&target.height>=44&&s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>=2&&r.left-ring>=0&&r.right+ring<=innerWidth&&r.top-ring>=0&&r.bottom+ring<=innerHeight&&el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)),rect:r.toJSON(),outline:[s.outlineWidth,s.outlineOffset],viewport:[innerWidth,innerHeight],label:el.getAttribute('aria-label')||el.textContent};
  });
  try{await expect.poll(async()=>(await measure()).valid).toBe(true);}catch(e){console.log('ENLARGED_TARGET '+JSON.stringify(await measure()));throw e;}
 };
 const tabTo=async(el:Locator)=>{
  await expect(el).toBeVisible();
  // Stay inside the document rather than cycling through browser chrome.
  const key=await el.evaluate(el=>Boolean(document.activeElement?.compareDocumentPosition(el)&Node.DOCUMENT_POSITION_PRECEDING))?'Shift+Tab':'Tab';
  const trail:string[]=[];
  for(let n=0;n<90;n++){
   trail.push(await page.evaluate(()=>{const el=document.activeElement as HTMLElement;return el.tagName+' '+el.className+' '+(el.getAttribute('aria-label')||el.textContent?.trim().slice(0,50));}));
   if(await el.evaluate(el=>document.activeElement===el)){await visible(el);return;}
   await page.keyboard.press(key);
  }
  console.log('ENLARGED_TAB_TRAIL '+JSON.stringify(trail));
  throw Error('Keyboard could not reach '+await el.getAttribute('class'));
 };
 const enter=async(el:Locator)=>{await tabTo(el);await page.keyboard.press('Enter');};
 const noOverflow=async()=>expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await noOverflow();
 const skip=page.getByRole('link',{name:t('Skip to content'),exact:true});
 await tabTo(skip);await page.keyboard.press('Enter');await expect(page.locator('main.home')).toBeFocused();
 await enter(b('Settings'));
 const dialog=page.getByRole('dialog',{name:t('Settings'),exact:true});await expect(dialog).toBeVisible();
 const done=dialog.getByRole('button',{name:t('Done'),exact:true}).first();await expect(done).toBeFocused();await visible(done);
 await page.keyboard.press('Escape');await expect(b('Settings')).toBeFocused();expect(await bytes()).toBe(before);
 await enter(b('New game →'));await expect(page.locator('.setup h1')).toBeFocused();await noOverflow();
 await enter(page.locator('.setup-options > summary'));
 await tabTo(page.locator('.setup #name'));await page.keyboard.type('Large text');
 await enter(b('← Back'));expect(await bytes()).toBe(before);
 await enter(page.locator('.hero-actions button').filter({hasText:t('How to play').trim()}));await expect(page.locator('.guide h1')).toBeFocused();await noOverflow();
 await enter(page.locator('.opening-example > summary'));await expect(page.locator('.opening-example')).toHaveAttribute('open','');
 await enter(b('Home'));expect(await bytes()).toBe(before);
 await enter(b('Continue game →'));await expect(page.locator('main.game')).toBeVisible();await noOverflow();
 const first=page.locator('.rack [data-tile-id="13"]');
 await expect(first).toHaveAccessibleName(t('red 1'));await expect(first).toBeFocused();await visible(first);
 const optionFit=await page.getByRole('combobox',{name:t('Table view'),exact:true}).evaluate(select=>{
  const probe=select.cloneNode(true) as HTMLSelectElement;
  probe.style.cssText='position:fixed;visibility:hidden;pointer-events:none;width:auto;min-width:0;max-width:none';
  select.parentElement!.appendChild(probe);
  const required=probe.getBoundingClientRect().width,actual=select.getBoundingClientRect().width;
  probe.remove();return {required,actual};
 });
 expect(optionFit.actual).toBeGreaterThanOrEqual(optionFit.required);
 await page.keyboard.press('Space');await expect(first).toHaveAttribute('aria-pressed','true');
 await expect(first.locator('.tile-check')).toHaveText('✓');
 await page.screenshot({path:`/tmp/runset-enlargement-selected-${info.project.name||'chromium'}-${locale}-${mode}.png`});
 await page.keyboard.press('ArrowRight');await expect(page.locator('.rack [data-tile-id="14"]')).toBeFocused();await visible(page.locator('.rack [data-tile-id="14"]'));
 expect(await bytes()).toBe(before);
 await enter(b('Settings'));await expect(done).toBeFocused();
 await tabTo(dialog.getByRole('checkbox',{name:t('Comfortable reading'),exact:true}));await page.keyboard.press('Space');
 await enter(done);await expect(b('Settings')).toBeFocused();await noOverflow();
 await expect(first).toHaveAttribute('aria-pressed','true');expect(await bytes()).toBe(before);
 await tabTo(page.locator('.rack .tile[tabindex="0"]'));await page.keyboard.press('Home');await expect(first).toBeFocused();await visible(first);await page.keyboard.press('n');
 const moved=reducer(initial,{type:'move',ids:[13],target:'new'});
 await expect.poll(async()=>JSON.parse((await bytes())!)).toEqual(moved);
 await enter(b('Undo move'));
 const undone=reducer(moved,{type:'undo'});
 await expect.poll(async()=>JSON.parse((await bytes())!)).toEqual(undone);
 await noOverflow();
 const marks=await page.locator('.game .tile:not(.joker)').evaluateAll(tiles=>tiles.map(el=>{
  const body=el.getBoundingClientRect();
  const symbols=Array.from(el.querySelectorAll('.tile-mark svg,.tile-foot svg')).map(el=>el.getBoundingClientRect());
  return {id:el.getAttribute('data-tile-id'),valid:symbols.length===2&&symbols.every(r=>r.width>=4&&r.width<=12&&r.height>=4&&r.height<=12&&r.left>=body.left&&r.right<=body.right&&r.top>=body.top&&r.bottom<=body.bottom&&(r.bottom<=body.top+body.height/3||r.top>=body.top+body.height*2/3))};
 }));
 expect(marks.filter(mark=>!mark.valid)).toEqual([]);
 await page.screenshot({path:`/tmp/runset-enlargement-${info.project.name||'chromium'}-${locale}-${mode}.png`});
 expect((await new AxeBuilder({page}).include('main.game').analyze()).violations).toEqual([]);
 console.log('ENLARGEMENT_REVIEW '+JSON.stringify({locale,mode,evidence,profile:info.project.name,browserVersion:page.context().browser()?.version()??null,viewport:await page.evaluate(()=>({width:innerWidth,height:innerHeight,dpr:devicePixelRatio})),physicalDevice:false}));
 expect(errors).toEqual([]);
}
