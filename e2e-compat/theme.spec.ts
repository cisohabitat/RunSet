import { test } from "@playwright/test";
import { verifyTheme } from "../e2e/helpers/theme";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: display choices preserve games and follow device only when requested`, ({
    page,
    context,
  }, info) => verifyTheme(page, context, info, locale, true));
