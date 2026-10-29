import { test } from "@playwright/test";
import { verifyFullMatch } from "./helpers/full-match";
test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: four-player match preserves scores through real rounds and recovery`, async ({
    page,
    context,
  }, info) => {
    test.setTimeout(180000);
    await verifyFullMatch(page, context, info, locale, false);
  });
