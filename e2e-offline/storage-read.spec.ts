import { test } from "@playwright/test";
import { verifyStorageRead } from "../e2e/helpers/storage-read";
test.use({ viewport: { width: 375, height: 667 } });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: failed read preserves primary and recovery bytes offline`, ({ page, context }) => verifyStorageRead(page, context, locale, true));
