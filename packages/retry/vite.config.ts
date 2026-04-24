import { defineConfig } from "vite-plus";

export default defineConfig({
  test: {
    coverage: {
      exclude: ["**/tests/sequence-policy.ts"],
    },
  },
  pack: {
    dts: true,
    entry: ["src/**/*", "!**/*.test.ts", "!**/*.spec.ts"],
    exports: true,
  },
});
