import { test } from "@playwright/test";
import { verifyPlayerComfortRelease } from "../e2e/helpers/player-comfort-release";
for (const locale of ["en", "zh-CN"] as const)
  test(locale + ": interrupted play, help, finishing and recovery work offline", ({ page, context }, info) =>
    verifyPlayerComfortRelease({ page, context }, info, locale));
