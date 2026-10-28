import { test } from "@playwright/test";
import { verifyResumeGuide } from "./helpers/resume-guide";
test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: returning player gets the actual next step without changing the save`, ({
    page,
    context,
  }, info) => verifyResumeGuide(page, context, info, locale, false));
