import js from "@eslint/js";
import html from "eslint-plugin-html";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.html"],
    plugins: {
      html
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        marked: "readonly",
        LayoutManager: "readonly",
        fetchUserStatus: "writable",
        renderHistory: "readonly",
        refreshStats: "readonly",
        showToast: "readonly",
        sanitizeHTML: "readonly",
        escapeHTML: "readonly"
      },
      ecmaVersion: "latest",
      sourceType: "module"
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "no-undef": "warn"
    }
  }
];
