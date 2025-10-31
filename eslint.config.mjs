import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import importPlugin from 'eslint-plugin-import';

/**
 * Shared browser globals
 */
const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  navigator: 'readonly',
  location: 'readonly',
  console: 'readonly',
  setTimeout: 'readonly',
  clearTimeout: 'readonly',
  fetch: 'readonly',
  Request: 'readonly',
  Response: 'readonly',
  Headers: 'readonly',
  localStorage: 'readonly',
  sessionStorage: 'readonly',
};

/**
 * Shared Node.js globals
 */
const nodeGlobals = {
  module: 'readonly',
  require: 'readonly',
  exports: 'readonly',
};

/**
 * Common rules across all file types
 */
const commonRules = {
  quotes: ['error', 'single', { avoidEscape: true }],
  'jsx-quotes': ['error', 'prefer-double'],
  semi: ['error', 'always'],
  'comma-dangle': ['error', 'always-multiline'],
  'no-console': ['warn', { allow: ['warn', 'error'] }],
  eqeqeq: ['error', 'always'],
  'object-curly-spacing': ['error', 'always'],
  'arrow-parens': ['error', 'always'],
};

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      'coverage/**',
      '.turbo/**',
      '.next/**',
      '**/.*//**', // Exclude all hidden folders
      '.*', // Exclude hidden files in root
      '*.d.ts',
      'vitest.config.ts',
    ],
  },
  {
    ...js.configs.recommended,
    languageOptions: {
      ...js.configs.recommended.languageOptions,
      globals: {
        ...js.configs.recommended.languageOptions?.globals,
        ...browserGlobals,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...commonRules,
    },
  },

  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
      },
      globals: {
        ...browserGlobals,
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...commonRules,
      quotes: 'off',
      '@typescript-eslint/quotes': ['error', 'single', { avoidEscape: true }],
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      // New rule to enforce alphabetical imports
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          pathGroups: [
            {
              pattern: '@/**',
              group: 'internal',
            },
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
  {
    files: ['packages/react/**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: {
        ...browserGlobals,
        ...nodeGlobals, // Add Node.js globals for JS files
      },
    },
  },
];
