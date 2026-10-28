import { test } from "@playwright/test";
import { verifyMenuClarity } from "./helpers/menu-clarity";
test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: menus keep safe choices clear and preserve unfinished games`, ({
    page,
    context,
  }, info) => verifyMenuClarity(page, context, info, locale, false));
