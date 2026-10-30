import {test} from "@playwright/test";
import {verifyReturnExpiry} from "./helpers/return-expiry";
test.use({viewport:{width:375,height:667},hasTouch:true});
for(const locale of ["en","zh-CN"] as const)
  test(`${locale}: returning after expiry explains the pending pass and preserves a history-free draft`,({page,context},info) => verifyReturnExpiry(page,context,info,locale,false));
