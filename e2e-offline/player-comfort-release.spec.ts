import { test } from "@playwright/test";
import { verifyPlayerComfortRelease } from "../e2e/helpers/player-comfort-release";
test.use({ hasTouch: true, viewport: { width: 375, height: 667 } });
for (const locale of ["en", "zh-CN"] as const)
  test(locale + ": a saved draft survives offline help, completion and backup recovery", ({ page, context }, info) =>
    verifyPlayerComfortRelease({ page, context }, info, locale));
