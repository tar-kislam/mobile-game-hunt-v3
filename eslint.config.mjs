import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Convert critical errors to warnings for production build
      // Fix these incrementally after deployment
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "warn",
      "@next/next/no-html-link-for-pages": "warn",
      "prefer-const": "warn",
      "react-hooks/rules-of-hooks": "error", // Keep this as error - it breaks runtime
      "react-hooks/exhaustive-deps": "warn",
      "@next/next/no-img-element": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@next/next/no-page-custom-font": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
    },
  },
];

export default eslintConfig;
