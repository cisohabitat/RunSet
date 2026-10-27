import { test } from "@playwright/test";
import { verifyTurnLayouts } from "../e2e/helpers/turn-layouts";
test.use({ hasTouch: true, viewport: { width: 375, height: 667 } });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: varied layouts keep instructions, selection, solutions and offline resume aligned`, ({
    page,
    context,
  }, info) => verifyTurnLayouts({ page, context }, info, locale));
