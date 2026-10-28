import { test } from "@playwright/test";
import { verifyPositionPractice } from "./helpers/position-practice";
test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: practice copy preserves the actual saved position`, ({
    page,
    context,
  }, info) => verifyPositionPractice(page, context, info, locale, false));
