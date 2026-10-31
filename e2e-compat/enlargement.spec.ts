import {test} from '@playwright/test';
import {verifyEnlargement} from '../e2e/helpers/enlargement';
for(const locale of ['en','zh-CN'] as const)
 test(`${locale}: enlarged reflow keeps keyboard controls and tile labels usable`,async({browser},info)=>{
  for(const size of [{width:640,height:406},{width:320,height:640}]){
   const context=await browser.newContext({viewport:info.project.use.viewport,hasTouch:info.project.use.hasTouch,isMobile:info.project.use.isMobile,serviceWorkers:'allow'});
   try{const page=await context.newPage();await verifyEnlargement(page,info,locale,String(info.project.use.baseURL),async()=>{
    await page.setViewportSize(size);return {kind:'CSS viewport reflow; not native browser zoom',...size};
   },`reflow${size.width}`,true);}finally{await context.close();}
  }
 });
