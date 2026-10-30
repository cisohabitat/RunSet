import { test } from "@playwright/test";
import { verifyMistakeRecovery } from "../e2e/helpers/mistake-recovery";
for (const locale of ["en","zh-CN"] as const)
  test(`${locale}: mistake help finds the actual joker and native Undo/Reset without acting`, ({page,context},info) => verifyMistakeRecovery(page,context,info,locale,true));
