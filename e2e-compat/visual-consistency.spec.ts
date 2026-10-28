import { test } from "@playwright/test";
import { verifyVisualConsistency } from "../e2e/helpers/visual-consistency";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: screens and display controls keep readable bounds`, ({
    page,
    context,
  }, info) => verifyVisualConsistency(page, context, info, locale, true));
