import fs from 'node:fs/promises'
import pluginJs from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import importPlugin from 'eslint-plugin-import'
import tailwind from 'eslint-plugin-tailwindcss'
import unusedImports from 'eslint-plugin-unused-imports'
import pluginVue from 'eslint-plugin-vue'
import globals from 'globals'
import neostandard from 'neostandard'
import tseslint from 'typescript-eslint'

const autoImport = JSON.parse(
  await fs.readFile('./.eslintrc-auto-import.json', 'utf8'),
)

const baseConfig = [
  { files: ['*/.{js,jsx,ts,tsx.vue}'] },
  {
    languageOptions: {
      globals: {
        // Include globals from auto-generated imports (e.g., Vue components,
        // composables) created by unplugin-auto-import during the build process
        ...autoImport.globals,

        // Add browser environment globals (window, document, etc.) to prevent
        // ESLint from flagging them as undefined
        ...globals.browser,
      },
    },
  },
  pluginJs.configs.recommended,
]

const tailwindConfig = [
  ...tailwind.configs['flat/recommended'],
  {
    rules: {
      // Include 'cva' (class-variance-authority) function calls when checking
      // Tailwind class ordering to ensure consistent class name arrangement
      // in component variants and conditional styles
      'tailwindcss/classnames-order': ['error', { callees: ['cva'] }],
    },
  },
]

const vueConfig = [
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['*/.vue'],
    languageOptions: { parserOptions: { parser: tseslint.parser } },
  },
  {
    rules: {
      'vue/multi-word-component-names': 0,
      'vue/no-reserved-component-names': 0,
      'vue/one-component-per-file': 0,
      'vue/html-quotes': ['error', 'single', { avoidEscape: true }],
    },
  },
]

const standardConfig = [
  ...neostandard(),
  importPlugin.flatConfigs.recommended,
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      'unused-imports/no-unused-imports': 'error',
    },
  },
  {
    rules: {
      // Allow assignment within return statements for concise expressions
      'no-return-assign': 0,

      // Disable ESLint's import resolution in favor of TypeScript's more accurate
      // module resolution which handles aliases, types, and dynamic imports correctly
      'import/no-unresolved': 0,

      // Enforce consistent import ordering by grouping imports into categories:
      // Node built-ins first, followed by external packages, internal modules,
      // relative imports, and finally type imports
      'import/order': ['error', {
        'newlines-between': 'never',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
          orderImportKind: 'asc',
        },
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
          'type',
        ],
      }],

      // Sort named imports within each import declaration
      // e.g. import { aaa, bbb, ccc } from 'module'
      'sort-imports': ['error', {
        ignoreDeclarationSort: true, // Let import/order handle declaration sorting
        allowSeparatedGroups: false,
        ignoreCase: true,
      }],
    },
  },
]

const stylisticConfig = [
  stylistic.configs['recommended-flat'],
  {
    rules: {
      '@stylistic/jsx-one-expression-per-line': 0,
      '@stylistic/quote-props': ['error', 'as-needed'],
      '@stylistic/space-before-function-paren': ['error', 'always'],
      '@stylistic/object-curly-spacing': ['error', 'always', {
        arraysInObjects: true,
        objectsInObjects: true,
      }],
      '@stylistic/jsx-curly-spacing': ['error', {
        when: 'never',
        children: true,
      }],
      '@stylistic/jsx-newline': ['error', {
        prevent: true,
      }],
      '@stylistic/jsx-sort-props': ['error', {
        callbacksLast: true,
        shorthandFirst: true,
        multiline: 'last',
        reservedFirst: true,
      }],
      '@stylistic/jsx-tag-spacing': ['error', {
        closingSlash: 'never',
        beforeSelfClosing: 'never',
        afterOpening: 'never',
        beforeClosing: 'never',
      }],
    },
  },
]

export default [
  ...baseConfig,
  ...tailwindConfig,
  ...vueConfig,
  ...standardConfig,
  ...stylisticConfig,

  // Must be last in the configuration order to properly override conflicting rules.
  // TypeScript's type system handles many checks more accurately than ESLint,
  // including import resolution, type checking, and variable usage.
  ...tseslint.configs.recommended,

  // The TypeScript config adds rules for JSX that we want to disable in favor of
  // the more accurate TypeScript type checking, which handles JSX syntax correctly
  // 'react/jsx-no-undef': 0,
]
