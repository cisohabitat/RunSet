import { defineConfig } from "@playwright/test";
import base from "./playwright.offline.config";

// Optional production Chromium resource/recovery audit. The required CI matrix
// retains all existing suites; these reuse the same connected session journeys.
export default defineConfig({
  ...base,
  testDir: ".",
  testMatch: ["e2e-compat/extended-session.spec.ts"],
  outputDir: "test-results/session-production",
  projects: [
    {
      name: "chromium-production",
      use: { viewport: { width: 375, height: 667 }, hasTouch: true },
    },
  ],
});
