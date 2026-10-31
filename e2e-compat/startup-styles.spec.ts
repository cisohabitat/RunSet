import {test} from "@playwright/test";
import {verifyStartupStyles} from "../e2e/helpers/startup-styles";
// Isolate cold document loads from the separate, fully retained offline journeys.
test.use({serviceWorkers:"block"});
for(const locale of ["en","zh-CN"] as const)
  test(`${locale}: first-use screen CSS waits safely without replacing the save`,({page},info)=>verifyStartupStyles(page,info,locale));
