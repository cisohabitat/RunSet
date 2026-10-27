import { test } from "@playwright/test";
import { verifyWholeTurn } from "../e2e/helpers/whole-turn";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: complete guided and quieter whole turns offline without changing saved games`, ({
    page,
    context,
  }, info) => verifyWholeTurn({ page, context }, info, locale));
