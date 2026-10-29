import { test } from "@playwright/test";
import { verifyExtendedSession } from "../e2e/helpers/extended-session";
for (const locale of ["en", "zh-CN"] as const)
  for (const timed of [false, true])
    test(`${locale}: extended offline session ${timed ? "expires the original turn once after a break" : "retains recovery and actual round transitions"}`, async ({
      page,
      context,
    }, info) => {
      test.setTimeout(180000);
      await verifyExtendedSession(page, context, info, locale, timed, true);
    });
