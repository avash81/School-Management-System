import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importSort from 'eslint-plugin-simple-import-sort';
import prettier from 'eslint-config-prettier';

const tsFiles = ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts'];

export default [
  {
    ignores: [
      '**/dist/**',
      '**/.next/**',
      '**/build/**',
      '**/node_modules/**',
      '**/coverage/**',
      '**/__pycache__/**',
      '**/next-env.d.ts',
    ],
  },
  js.configs.recommended,
  {
    files: tsFiles,
    languageOptions: {
      parser: tsParser,
      globals: {
        Response: 'readonly',
        FormData: 'readonly',
        HTMLFormElement: 'readonly',
        fetch: 'readonly',
        TextEncoder: 'readonly',
        URL: 'readonly',
        crypto: 'readonly',
        process: 'readonly',
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: false
      }
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'simple-import-sort': importSort
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    }
  },
  {
    files: ['**/*.mjs'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
  },
  prettier
];
