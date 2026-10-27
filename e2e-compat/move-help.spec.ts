import { test } from "@playwright/test";
import { verifyMoveHelp } from "../e2e/helpers/move-help";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: move help shows actual affected tiles and one safe next action offline`, ({
    page,
    context,
  }, info) => verifyMoveHelp({ page, context }, info, locale));
