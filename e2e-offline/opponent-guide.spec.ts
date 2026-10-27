import { test } from "@playwright/test";
import { verifyOpponentGuide } from "../e2e/helpers/opponent-guide";
test.use({ hasTouch: true, viewport: { width: 375, height: 667 } });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: opponent explanations work on first offline use`, ({
    page,
    context,
  }, info) => verifyOpponentGuide({ page, context }, info, locale));
