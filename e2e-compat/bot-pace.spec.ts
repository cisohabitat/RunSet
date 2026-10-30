import {test} from "@playwright/test";
import {verifyBotPace} from "../e2e/helpers/bot-pace";
for(const locale of ["en","zh-CN"] as const)
  test(`${locale}: all four paces delay a real Easy plan and preserve its choices offline`,({page,context},info)=>verifyBotPace(page,context,info,locale,true));
