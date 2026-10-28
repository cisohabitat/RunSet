import { test } from "@playwright/test";
import { verifyHistoryBrowsing } from "../e2e/helpers/history-browsing";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: difficulty filters and expandable scores preserve local records`, ({
    page,
    context,
  }, info) => verifyHistoryBrowsing(page, context, info, locale, true));
