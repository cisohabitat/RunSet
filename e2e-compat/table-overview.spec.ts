import { test } from "@playwright/test";
import { verifyTableOverview } from "../e2e/helpers/table-overview";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: crowded table overview finds an unfinished meld without changing the game`, ({
    page,
    context,
  }, info) => verifyTableOverview({ page, context }, info, locale));
