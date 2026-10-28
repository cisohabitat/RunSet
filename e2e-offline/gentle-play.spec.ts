import { test } from "@playwright/test";
import { verifyGentlePlay } from "../e2e/helpers/gentle-play";
test.use({ hasTouch: true, viewport: { width: 375, height: 667 } });
for (const locale of ["en", "zh-CN"] as const)
  test(locale + ": fresh results and turn handoffs work offline", ({ page, context }, info) =>
    verifyGentlePlay({ page, context }, info, locale));
