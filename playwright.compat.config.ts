import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: ".",
  testMatch: [
    "e2e-compat/**/*.spec.ts",
    "e2e/narration.spec.ts",
    "e2e/move-review.spec.ts",
    "e2e/practice-suggestion.spec.ts",
    "e2e/contrast.spec.ts",
    "e2e/session-comfort.spec.ts",
    "e2e/simple-home.spec.ts",
    "e2e/meld-inspector.spec.ts",
    "e2e/touch-feedback.spec.ts",
    "e2e/feedback.spec.ts",
    "e2e/whole-turn-recovery.spec.ts",
  ],
  timeout: 60000,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  outputDir: "test-results/compat",
  use: {
    baseURL: process.env.RUNSET_BASE_URL || "http://localhost:4176",
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "webkit-phone",
      use: {
        browserName: "webkit",
        viewport: { width: 375, height: 667 },
        hasTouch: true,
        isMobile: true,
        launchOptions: { executablePath: process.env.RUNSET_WEBKIT_PATH },
      },
    },
    {
      name: "webkit-ipad",
      use: {
        browserName: "webkit",
        viewport: { width: 1180, height: 820 },
        hasTouch: true,
        isMobile: true,
        launchOptions: { executablePath: process.env.RUNSET_WEBKIT_PATH },
      },
    },
    {
      name: "firefox-desktop",
      use: { browserName: "firefox", viewport: { width: 1180, height: 820 } },
    },
  ],
  webServer: process.env.RUNSET_BASE_URL
    ? undefined
    : {
        command: "npm run preview -- --port 4176",
        url: "http://localhost:4176",
        reuseExistingServer: false,
      },
});
