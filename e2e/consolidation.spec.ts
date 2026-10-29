import {test} from "@playwright/test";
import {verifyReleaseConsolidation} from "./helpers/release-consolidation";
test.use({viewport:{width:375,height:667},hasTouch:true});
for(const locale of ["en","zh-CN"] as const) test(locale+": connected beginner release and responsive header",async({page,context},info)=>{test.setTimeout(120000);await verifyReleaseConsolidation(page,context,info,locale,false);});
