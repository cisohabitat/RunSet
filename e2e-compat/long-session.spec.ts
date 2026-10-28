import { test } from "@playwright/test";
import { verifyLongSession } from "../e2e/helpers/long-session";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: repeated crowded-table edits survive offline reload`, ({ page, context }, info) => verifyLongSession(page, context, info, locale));
