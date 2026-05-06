import { playwright } from "@vitest/browser-playwright";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["html", "json", "lcov", "text"],
      exclude: [...configDefaults.exclude, "**/dist/**", "**/sequence-policy.ts"],
    },
    exclude: [...configDefaults.exclude, "**/dist/**", "**/node_modules/**"],
    globals: true,
    outputFile: process.env.CI ? { junit: "./coverage/junit.xml" } : undefined,
    projects: [
      {
        extends: true,
        test: {
          environment: "node",
          include: ["packages/**/*.node.test.ts"],
          name: {
            color: "green",
            label: "node",
          },
        },
      },
      {
        extends: true,
        test: {
          browser: {
            enabled: true,
            headless: true,
            instances: [{ browser: "chromium" }],
            provider: playwright(),
          },
          include: ["packages/**/*.browser.test.ts"],
          name: {
            color: "cyan",
            label: "browser",
          },
        },
      },
    ],
    reporters: process.env.CI ? ["dot", "junit"] : ["default"],
    restoreMocks: true,
  },
});
