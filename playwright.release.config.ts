import {defineConfig} from "@playwright/test";
import base from "./playwright.compat.config";
export default defineConfig({...base,testMatch:["e2e-compat/consolidation.spec.ts"],projects:[{name:"chromium",use:{browserName:"chromium",viewport:{width:375,height:667},hasTouch:true}},...base.projects!]});
