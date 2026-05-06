import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["html", "json", "lcov", "text"],
      exclude: [...configDefaults.exclude, "**/dist/**", "**/sequence-policy.ts"],
    },
    environment: "node",
    exclude: ["dist", "node_modules"],
    globals: true,
    outputFile: process.env.CI ? { junit: "./coverage/junit.xml" } : undefined,
    projects: ["packages/*"],
    reporters: process.env.CI ? ["dot", "junit"] : ["default"],
    restoreMocks: true,
  },
});
