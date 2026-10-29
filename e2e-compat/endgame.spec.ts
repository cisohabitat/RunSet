import { test } from "@playwright/test";
import { verifyEndgame } from "../e2e/helpers/endgame";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: Hard finishes a crowded position on first offline worker use`, ({
    page,
    context,
  }, info) => verifyEndgame(page, context, info, locale, true));
