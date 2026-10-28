import { test } from "@playwright/test";
import { verifyRecentTurns } from "../e2e/helpers/recent-turns";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: public turn replay preserves play, expiry and visit boundaries`, ({
    page,
    context,
  }, info) => verifyRecentTurns(page, context, info, locale, true));
