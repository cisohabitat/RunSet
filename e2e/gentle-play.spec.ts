import { test } from "@playwright/test";
import { verifyGentlePlay } from "./helpers/gentle-play";
test.use({ hasTouch: true, viewport: { width: 375, height: 667 } });
for (const locale of ["en", "zh-CN"] as const)
  test(locale + ": fresh results and turn handoffs preserve calm feedback", ({ page, context }, info) =>
    verifyGentlePlay({ page, context }, info, locale, false));
