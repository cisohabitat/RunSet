import { test } from "@playwright/test";
import { verifyTableOverview } from "./helpers/table-overview";
test.use({ hasTouch: true, viewport: { width: 375, height: 667 } });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: table overview preserves a full Undo history, hidden rack and selections`, ({
    page,
    context,
  }, info) => verifyTableOverview({ page, context }, info, locale, false));
