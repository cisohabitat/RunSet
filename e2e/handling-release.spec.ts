import { test } from "@playwright/test";
import { verifyHandlingRelease } from "./helpers/handling-release";
test.use({ viewport: { width: 1440, height: 900 } });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: keyboard handling, display, practice, backup and deletion journey`, ({
    page,
    context,
  }, info) => verifyHandlingRelease({ page, context }, info, locale, true));
