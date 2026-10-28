import { test } from "@playwright/test";
import { verifyRecentTurns } from "./helpers/recent-turns";
test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: public turn replay preserves play, expiry and visit boundaries`, ({
    page,
    context,
  }, info) => verifyRecentTurns(page, context, info, locale, false));
