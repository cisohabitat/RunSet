import {test} from "@playwright/test";
import {verifyReleaseConsolidation} from "../e2e/helpers/release-consolidation";
for(const locale of ["en","zh-CN"] as const) test(locale+": connected beginner release works offline with responsive headers",async({page,context},info)=>{test.setTimeout(120000);await verifyReleaseConsolidation(page,context,info,locale,true);});
