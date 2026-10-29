import { test } from "@playwright/test";
import { verifyCrowdedNavigation } from "./helpers/crowded-navigation";
test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: crowded default destinations, latest play and rack navigation`, ({
    page,
    context,
  }, info) => verifyCrowdedNavigation(page, context, info, locale, false));
