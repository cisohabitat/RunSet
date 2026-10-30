import { test } from "@playwright/test";
import { verifyMistakeRecovery } from "./helpers/mistake-recovery";
test.use({viewport:{width:375,height:667},hasTouch:true});
for (const locale of ["en","zh-CN"] as const)
  test(`${locale}: mistake help finds the actual joker and native Undo/Reset without acting`, ({page,context},info) => verifyMistakeRecovery(page,context,info,locale,false));
