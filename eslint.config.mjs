import { dirname } from 'path';
import { fileURLToPath } from 'url';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import prettierPlugin from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Base Next.js configs
const eslintConfig = [
  // Ignores
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'commitlint.config.js',
    ],
  },
  // Core Next.js, TypeScript, and React rules
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json', // For TypeScript-specific rules
      },
      globals: {
        __NEXT_DATA__: 'readonly', // Next.js global
        process: 'readonly',
        console: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // Strict rules
      'no-unused-vars': 'off', // Disabled globally; use TS version
      '@typescript-eslint/no-unused-vars': 'error',
      eqeqeq: 'error', // Enforce strict equality (===)
      'no-console': 'warn', // Warn on console.log
      'prefer-const': 'error', // Prefer const over let
      '@typescript-eslint/no-explicit-any': 'warn', // Avoid 'any' type
      'react/react-in-jsx-scope': 'off', // Not needed in Next.js 13+
      'react/prop-types': 'off', // TypeScript handles this
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'prettier/prettier': 'error', // Enforce Prettier formatting
      // Next.js core-web-vitals rules (moved here)
      'react/no-unescaped-entities': 'error',
      'react/no-unknown-property': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  // Prettier recommended rules
  {
    rules: {
      ...prettierConfig.rules, // Disable ESLint rules that conflict with Prettier
    },
  },
];

export default eslintConfig;
