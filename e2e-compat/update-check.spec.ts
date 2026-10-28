import { test } from "@playwright/test";
import { verifyUpdateCheck } from "../e2e/helpers/update-check";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: update checks preserve timed drafts and offline Undo`, ({
    page,
    context,
  }, info) => verifyUpdateCheck(page, context, info, locale));
