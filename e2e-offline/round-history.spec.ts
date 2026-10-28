import { test } from "@playwright/test";
import { verifyRoundHistory } from "../e2e/helpers/round-history";
test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: real round history counts once and clears without touching saved games`, ({
    page,
    context,
  }, info) => verifyRoundHistory(page, context, info, locale, true));
