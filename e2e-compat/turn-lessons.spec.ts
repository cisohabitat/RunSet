import { test } from "@playwright/test";
import { verifyTurnLessons } from "../e2e/helpers/turn-lessons";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: complete extension, rearrangement, joker and draw turns offline`, ({
    page,
    context,
  }, info) => verifyTurnLessons({ page, context }, info, locale));
