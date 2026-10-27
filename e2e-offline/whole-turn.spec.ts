import { test } from "@playwright/test";
import { verifyWholeTurn } from "../e2e/helpers/whole-turn";
test.use({ hasTouch: true, viewport: { width: 375, height: 667 } });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: complete guided and quieter whole turns offline without changing saved games`, ({
    page,
    context,
  }, info) => verifyWholeTurn({ page, context }, info, locale));
