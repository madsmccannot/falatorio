import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    files: ["src/**/*.ts"],
    extends: [tseslint.configs.base],
  },
  {
    ignores: ["dist/", "node_modules/"],
  },
);
