import {defineConfig} from "@playwright/test";
import base from "./playwright.compat.config";
export default defineConfig({
  ...base,
  testDir: "./e2e-upgrade",
  testMatch: "**/*.spec.ts",
  timeout: 180000,
  workers: 1,
  outputDir: "test-results/upgrade-browser",
  projects: [{name:"chromium",use:{browserName:"chromium",viewport:{width:375,height:667},hasTouch:true}}, ...base.projects!],
  webServer: undefined,
});
