import { test } from "@playwright/test";
import { verifyRuleExamples } from "./helpers/rule-examples";
test.use({ viewport: { width: 360, height: 640 }, hasTouch: true });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: opening and joker examples stay readable without editing a saved game`, ({
    page,
    context,
  }, info) => verifyRuleExamples(page, context, info, locale, false));
