import { test } from "@playwright/test";
import { verifyHandlingRelease } from "../e2e/helpers/handling-release";
test.use({ hasTouch: true, viewport: { width: 375, height: 667 } });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: combined handling, display, practice, backup and deletion journey offline`, ({
    page,
    context,
  }, info) => verifyHandlingRelease({ page, context }, info, locale));
