import { test } from "@playwright/test";
import { verifyTheme } from "../e2e/helpers/theme";
test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: display choices preserve games and follow device only when requested`, ({
    page,
    context,
  }, info) => verifyTheme(page, context, info, locale, true));
