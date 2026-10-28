import { test } from "@playwright/test";
import { verifyPlayerComfortRelease } from "./helpers/player-comfort-release";
test.use({ hasTouch: true, viewport: { width: 375, height: 667 } });
for (const locale of ["en", "zh-CN"] as const)
  test(locale + ": interrupted play, help, finishing and backup recovery stay connected", ({ page, context }, info) =>
    verifyPlayerComfortRelease({ page, context }, info, locale, false));
