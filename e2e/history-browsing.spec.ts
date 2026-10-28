import { test } from "@playwright/test";
import { verifyHistoryBrowsing } from "./helpers/history-browsing";
test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: difficulty filters and expandable scores preserve local records`, ({
    page,
    context,
  }, info) => verifyHistoryBrowsing(page, context, info, locale, false));
