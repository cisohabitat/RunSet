import {test} from "@playwright/test";
import {verifyMistakePractice} from "./helpers/mistake-practice";
test.use({viewport:{width:375,height:667},hasTouch:true});
for (const locale of ["en","zh-CN"] as const)
  for (const scenario of ["opening","repair","joker"] as const)
    test(locale+": "+scenario+" correction opens isolated relevant practice",({page,context},info)=>
      verifyMistakePractice(page,context,info,locale,scenario,false));
