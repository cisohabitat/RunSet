import { test } from "@playwright/test";
import { verifyTableArrangement } from "../e2e/helpers/table-arrangement";
test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: offline table organisation retains saves and preferences`, ({
    page,
    context,
  }, info) => verifyTableArrangement(page, context, info, locale));
