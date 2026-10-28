import { test } from "@playwright/test";
import { verifyTableOverview } from "../e2e/helpers/table-overview";
test.use({ hasTouch: true, viewport: { width: 375, height: 667 } });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: crowded table overview works on first offline use`, ({
    page,
    context,
  }, info) => verifyTableOverview({ page, context }, info, locale));
