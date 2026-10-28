import { test } from "@playwright/test";
import { verifyStorageRead } from "./helpers/storage-read";
test.use({ viewport: { width: 375, height: 667 } });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: temporary read failure keeps the saved draft`, ({ page, context }) => verifyStorageRead(page, context, locale, false));
