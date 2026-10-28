import { test } from "@playwright/test";
import { verifyResumeGuide } from "../e2e/helpers/resume-guide";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: returning player gets the actual next step without changing the save`, ({
    page,
    context,
  }, info) => verifyResumeGuide(page, context, info, locale, true));
