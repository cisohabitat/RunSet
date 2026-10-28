import { test } from "@playwright/test";
import { verifyTableArrangement } from "../e2e/helpers/table-arrangement";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: table organisation is display-only and works offline`, ({
    page,
    context,
  }, info) => verifyTableArrangement(page, context, info, locale));
