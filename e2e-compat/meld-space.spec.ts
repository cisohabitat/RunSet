import { test } from "@playwright/test";
import { verifyMeldSpace } from "../e2e/helpers/meld-space";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: tile-sized drafts retain readable controls and long runs`, ({
    page,
    context,
  }, info) => verifyMeldSpace(page, context, info, locale, true));
