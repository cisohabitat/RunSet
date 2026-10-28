import { test } from "@playwright/test";
import { verifyTableArrangement } from "./helpers/table-arrangement";
test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: table organisation preserves real destinations`, ({
    page,
    context,
  }, info) => verifyTableArrangement(page, context, info, locale, false));
