import { test } from "@playwright/test";
import { verifyTurnLayouts } from "../e2e/helpers/turn-layouts";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: varied layouts keep instructions, selection, solutions and offline resume aligned`, ({
    page,
    context,
  }, info) => verifyTurnLayouts({ page, context }, info, locale));
