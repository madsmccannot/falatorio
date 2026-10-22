import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.d.ts",
        "src/env.ts",
        "src/index.ts",
      ],
      thresholds: {
        statements: 35,
        branches: 35,
        functions: 15,
        lines: 35,
      },
    },
  },
});
