import { test } from "@playwright/test";
import { verifyTurnConfidence } from "../e2e/helpers/turn-confidence";
test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: turn labels distinguish drafts from real acceptance and expiry`, ({
    page,
    context,
  }, info) => verifyTurnConfidence(page, context, info, locale, true));
