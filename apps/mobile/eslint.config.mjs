import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    files: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}", "hooks/**/*.{ts,tsx}", "lib/**/*.{ts,tsx}"],
    extends: [tseslint.configs.base],
  },
  {
    ignores: [".expo/", "dist/", "node_modules/", "android/", "ios/"],
  },
);
