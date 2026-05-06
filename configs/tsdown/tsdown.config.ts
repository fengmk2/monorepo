import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/**/*", "!**/*.test.ts", "!**/*.spec.ts"],
  format: "esm",
  dts: true,
  clean: true,
  outDir: "dist",
});
