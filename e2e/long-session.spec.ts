import { test } from "@playwright/test";
import { verifyLongSession } from "./helpers/long-session";
test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: repeated crowded-table edits preserve a timed save`, ({ page, context }, info) => verifyLongSession(page, context, info, locale));
