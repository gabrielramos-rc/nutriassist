import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Test coverage output:
    "coverage/**",
  ]),
  // Global rules
  {
    rules: {
      // Allow underscore-prefixed variables to be unused
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Warn on console.log/info, allow console.warn/error
      "no-console": ["warn", { allow: ["warn", "error"] }],
      // Warn when cyclomatic complexity exceeds 15
      complexity: ["warn", { max: 15 }],
      // Warn when function exceeds 100 lines
      "max-lines-per-function": ["warn", { max: 100, skipBlankLines: true, skipComments: true }],
    },
  },
  // Stricter rules for services (explicit return types)
  {
    files: ["src/services/**/*.ts"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": [
        "warn",
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
    },
  },
]);

export default eslintConfig;
