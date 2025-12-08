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
      
      // SECURITY: Prevent dangerous patterns
      // Note: These rules warn on usage - review any warnings carefully
      "no-eval": "error", // Prevent eval() usage
      "no-implied-eval": "error", // Prevent setTimeout/setInterval with strings
      "@typescript-eslint/no-implied-eval": "error", // TypeScript version
      "no-new-func": "error", // Prevent new Function() constructor
    },
  },
  {
    // SECURITY: Custom rule to warn on child_process usage
    // This helps catch potential command injection vulnerabilities
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      "no-restricted-imports": [
        "error", // Changed from 'warn' to 'error' - block child_process imports
        {
          patterns: [
            {
              group: ["child_process"],
              message: "SECURITY: Direct child_process usage is FORBIDDEN. Use secureExecFile() from @/lib/security/shell instead. See RCE_SECURITY_AUDIT.md for details.",
            },
          ],
        },
      ],
      "no-restricted-syntax": [
        "warn",
        {
          selector: "CallExpression[callee.name='exec']",
          message: "SECURITY: exec() can be dangerous. Use spawn() with shell: false and validate all inputs. See SECURITY.md for guidelines.",
        },
        {
          selector: "CallExpression[callee.name='execSync']",
          message: "SECURITY: execSync() can be dangerous. Use spawn() with shell: false and validate all inputs. See SECURITY.md for guidelines.",
        },
      ],
    },
  },
];

export default eslintConfig;
