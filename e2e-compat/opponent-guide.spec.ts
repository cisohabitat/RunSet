import { test } from "@playwright/test";
import { verifyOpponentGuide } from "../e2e/helpers/opponent-guide";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: actual opponent styles explain fair play without changing the game`, ({
    page,
    context,
  }, info) => verifyOpponentGuide({ page, context }, info, locale));
