import { test } from "@playwright/test";
import { verifyCrowdedNavigation } from "../e2e/helpers/crowded-navigation";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: crowded default destinations, latest play and rack navigation offline`, ({
    page,
    context,
  }, info) => verifyCrowdedNavigation(page, context, info, locale, true));
