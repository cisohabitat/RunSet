import { test } from "@playwright/test";
import { verifyFullMatch } from "../e2e/helpers/full-match";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: four-player match completes offline with boundary and draft recovery`, async ({
    page,
    context,
  }, info) => {
    test.setTimeout(180000);
    await verifyFullMatch(page, context, info, locale, true);
  });
