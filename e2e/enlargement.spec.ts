import {test,expect,chromium} from '@playwright/test';
import {mkdtemp,mkdir,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {verifyEnlargement} from './helpers/enlargement';
for(const locale of ['en','zh-CN'] as const) test(`${locale}: native 200% browser zoom and minimum font preserve keyboard play`,async({},info)=>{
 const root=await mkdtemp(join(tmpdir(),'runset-enlargement-'));
 const extension=join(root,'extension');await mkdir(extension);
 await writeFile(join(extension,'manifest.json'),JSON.stringify({manifest_version:3,name:'RunSet isolated enlargement verification',version:'1.0',permissions:['tabs','fontSettings'],background:{service_worker:'background.js'}}));
 await writeFile(join(extension,'background.js'),'chrome.runtime.onInstalled.addListener(()=>{});');
 try{for(const mode of ['zoom200','font24'] as const){
  const context=await chromium.launchPersistentContext(join(root,mode),{executablePath:chromium.executablePath(),channel:'chromium',headless:true,viewport:null,args:['--no-sandbox','--window-size=1280,900',`--disable-extensions-except=${extension}`,`--load-extension=${extension}`]});
  try{
   const worker=context.serviceWorkers()[0]??await context.waitForEvent('serviceworker',{timeout:5000});const page=await context.newPage();
   await verifyEnlargement(page,info,locale,String(info.project.use.baseURL),async()=>{
    const before=await page.locator('.hero-meta').evaluate(el=>{const r=document.createRange();r.selectNodeContents(el.firstElementChild!);return r.getBoundingClientRect().height;});
    const setting=await worker.evaluate(async({url,mode})=>{
     if(mode==='zoom200'){const tabs=await chrome.tabs.query({});const tab=tabs.find(tab=>tab.url===url)!;await chrome.tabs.setZoom(tab.id!,2);return chrome.tabs.getZoom(tab.id!);}
     await chrome.fontSettings.setMinimumFontSize({pixelSize:24});return (await chrome.fontSettings.getMinimumFontSize({})).pixelSize;
    },{url:page.url(),mode});
    expect(setting).toBe(mode==='zoom200'?2:24);
    if(mode==='zoom200')await expect.poll(()=>page.evaluate(()=>innerWidth)).toBe(640);
    else await expect.poll(()=>page.locator('.hero-meta').evaluate(el=>{const r=document.createRange();r.selectNodeContents(el.firstElementChild!);return r.getBoundingClientRect().height;})).toBeGreaterThan(before);
    return {setting,beforeTextHeight:before,afterTextHeight:await page.locator('.hero-meta').evaluate(el=>{const r=document.createRange();r.selectNodeContents(el.firstElementChild!);return r.getBoundingClientRect().height;})};
   },mode);
  }finally{await context.close();}
 }}finally{await rm(root,{recursive:true,force:true});}
});
