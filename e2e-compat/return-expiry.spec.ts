import {test} from "@playwright/test";
import {verifyReturnExpiry} from "../e2e/helpers/return-expiry";
for(const locale of ["en","zh-CN"] as const)
  test(`${locale}: returning after expiry explains the pending pass and preserves a history-free draft`,({page,context},info) => verifyReturnExpiry(page,context,info,locale,true));
