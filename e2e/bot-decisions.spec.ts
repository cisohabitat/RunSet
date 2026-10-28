import { test } from "@playwright/test";
import { verifyBotDecisions } from "./helpers/bot-decisions";
test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: actual worker opens with five tiles and takes the winning extension`, ({
    page,
    context,
  }, info) => verifyBotDecisions(page, context, info, locale, false));
