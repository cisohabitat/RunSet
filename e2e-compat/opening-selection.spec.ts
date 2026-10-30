import { test } from "@playwright/test";
import { verifyOpeningSelection } from "../e2e/helpers/opening-selection";
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: crowded opening guides locked table selections to rack-only play`, ({page,context},info) => verifyOpeningSelection(page,context,info,locale,true));
