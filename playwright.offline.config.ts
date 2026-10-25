import { defineConfig } from "@playwright/test";
import base from "./playwright.config";
export default defineConfig({
  ...base,
  testDir: "./e2e-offline",
  workers: 1,
  use: { ...base.use, baseURL: "http://localhost:4173" },
  webServer: {
    command: "npm run preview -- --port 4173",
    url: "http://localhost:4173",
    reuseExistingServer: false,
  },
});
