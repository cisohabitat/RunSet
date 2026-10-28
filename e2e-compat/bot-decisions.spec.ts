import { test } from "@playwright/test";
import { verifyBotDecisions } from "../e2e/helpers/bot-decisions";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: actual worker opens with five tiles and takes the winning extension`, ({
    page,
    context,
  }, info) => verifyBotDecisions(page, context, info, locale, true));
