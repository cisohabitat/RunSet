import { test } from "@playwright/test";
import { verifyStorageRead } from "../e2e/helpers/storage-read";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: interrupted saved-game read recovers offline`, ({ page, context }) => verifyStorageRead(page, context, locale, true));
