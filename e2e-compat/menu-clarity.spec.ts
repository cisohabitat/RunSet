import { test } from "@playwright/test";
import { verifyMenuClarity } from "../e2e/helpers/menu-clarity";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: menus keep safe choices clear and preserve unfinished games`, ({
    page,
    context,
  }, info) => verifyMenuClarity(page, context, info, locale, true));
