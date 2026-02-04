import js from "@eslint/js"
import globals from "globals"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import tseslint from "typescript-eslint"
import prettierConfig from "eslint-config-prettier" // 추가 설치 필요
import prettierPlugin from "eslint-plugin-prettier" // 추가 설치 필요

export default tseslint.config(
  {
    ignores: ["dist", "node_modules"], // globalIgnores 대신 이 방식 권장
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      prettier: prettierPlugin, // Prettier를 ESLint 안에서 실행
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
      ...prettierConfig.rules,
    },
  }
)
