import { test } from "@playwright/test";
import { verifyExtendedSession } from "./helpers/extended-session";
test.use({ viewport: { width: 375, height: 667 }, hasTouch: true });
for (const locale of ["en", "zh-CN"] as const)
  for (const timed of [false, true])
    test(`${locale}: extended session ${timed ? "expires the original turn once after a break" : "recovers drafts and completes real rounds"}`, async ({
      page,
      context,
    }, info) => {
      test.setTimeout(180000);
      await verifyExtendedSession(page, context, info, locale, timed, false);
    });
