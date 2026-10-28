import { test } from "@playwright/test";
import { verifyPositionPractice } from "../e2e/helpers/position-practice";
test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: current-position practice works without changing offline saves`, ({
    page,
    context,
  }, info) => verifyPositionPractice(page, context, info, locale));
