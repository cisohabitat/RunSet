import { test } from "@playwright/test";
import { verifyGentlePlay } from "../e2e/helpers/gentle-play";
for (const locale of ["en", "zh-CN"] as const)
  test(locale + ": fresh results and full-screen turn handoffs use actual transitions", ({ page, context }, info) =>
    verifyGentlePlay({ page, context }, info, locale));
