import { test } from "@playwright/test";
import { verifyPositionPractice } from "../e2e/helpers/position-practice";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: practice copy is isolated and available offline`, ({
    page,
    context,
  }, info) => verifyPositionPractice(page, context, info, locale));
