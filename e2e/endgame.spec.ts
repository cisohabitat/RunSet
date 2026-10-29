import { test } from "@playwright/test";
import { verifyEndgame } from "./helpers/endgame";
test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: Hard finishes a crowded empty-pool position through the real worker`, ({
    page,
    context,
  }, info) => verifyEndgame(page, context, info, locale, false));
