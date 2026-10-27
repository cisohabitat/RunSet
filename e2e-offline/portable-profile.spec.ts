import { test } from "@playwright/test";
import { verifyPortableProfile } from "../e2e/helpers/portable-profile";
test.use({ hasTouch: true, viewport: { width: 375, height: 667 } });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: portable profiles validate, roll back, preserve or replace games and resume learning offline`, ({
    page,
    context,
  }, info) => verifyPortableProfile({ page, context }, info, locale));
