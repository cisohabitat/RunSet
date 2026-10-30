import {test} from "@playwright/test";
import {verifyBotPace} from "./helpers/bot-pace";
test.use({viewport:{width:375,height:667},hasTouch:true});
for(const locale of ["en","zh-CN"] as const)
  test(`${locale}: all four paces delay a real Easy plan and preserve its choices`,({page,context},info)=>verifyBotPace(page,context,info,locale,false));
