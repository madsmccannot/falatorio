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
        "src/l1-profiles/**",
        "src/gamification/achievement-rules.ts",
      ],
      thresholds: {
        statements: 5,
        branches: 30,
        functions: 30,
        lines: 5,
      },
    },
  },
});
