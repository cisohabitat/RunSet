import { test } from "@playwright/test";
import { verifyOpeningSelection } from "./helpers/opening-selection";
test.use({viewport:{width:375,height:667},hasTouch:true});
for (const locale of ["en", "zh-CN"] as const)
  test(`${locale}: crowded opening guides locked table selections to rack-only play`, ({page,context},info) => verifyOpeningSelection(page,context,info,locale,false));
