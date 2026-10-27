import { test } from "@playwright/test";
import { verifyHandlingRelease } from "../e2e/helpers/handling-release";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: combined handling, display, practice, backup and deletion journey offline`, ({
    page,
    context,
  }, info) => verifyHandlingRelease({ page, context }, info, locale));
