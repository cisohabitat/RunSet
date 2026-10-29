import { test } from "@playwright/test";
import { verifyRuleExamples } from "../e2e/helpers/rule-examples";
// Each production project disconnects before its first rules/example visit.
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: opening and joker examples work on first offline use`, ({
    page,
    context,
  }, info) => verifyRuleExamples(page, context, info, locale, true));
