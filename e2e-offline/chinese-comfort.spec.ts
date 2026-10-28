import { test } from "@playwright/test";
import { verifyChineseComfort } from "../e2e/helpers/chinese-comfort";
test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: fresh computer names stay separate from literal saved names`, ({
    page,
    context,
  }, info) => verifyChineseComfort(page, context, info, locale, true));
