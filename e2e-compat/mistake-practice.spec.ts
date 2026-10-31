import {test} from "@playwright/test";
import {verifyMistakePractice} from "../e2e/helpers/mistake-practice";
for (const locale of ["en","zh-CN"] as const)
  for (const scenario of ["opening","repair","joker"] as const)
    test(locale+": "+scenario+" correction is first-use offline and isolated",({page,context},info)=>
      verifyMistakePractice(page,context,info,locale,scenario,true));
