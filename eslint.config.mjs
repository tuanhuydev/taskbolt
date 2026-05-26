// @ts-check
import eslint from "@eslint/js";
import pluginVue from "eslint-plugin-vue";
import globals from "globals";
import tseslint from "typescript-eslint";
// 1. Import the prettier config
import skipFormatting from "eslint-config-prettier";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "src/shims-*.d.ts", "src/env.d.ts"],
  },

  {
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...pluginVue.configs["flat/recommended"],
      // 2. Add it at the end to turn off conflicting rules
      skipFormatting,
    ],
    files: ["**/*.{ts,vue}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "vue/multi-word-component-names": "off",
      "vue/no-v-html": "off",
      // You can now safely remove the manual "off" overrides
      // for formatting rules, as 'skipFormatting' handles them!
    },
  },
);
