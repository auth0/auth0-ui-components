import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import jsdocPlugin from 'eslint-plugin-jsdoc';
import globals from 'globals';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  js.configs.recommended,

  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/.next/**',
      '**/*.d.ts',
      '**/docs-api/**',
      '**/examples/**',
      '**/docs-site/**',
    ],
  },

  // TypeScript and React files configuration
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        tsconfigRootDir: __dirname,
        project: false,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        React: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'import': importPlugin,
      'jsdoc': jsdocPlugin,
    },
    rules: {
      // Disable base rules that TypeScript handles
      'no-unused-vars': 'off',
      'no-undef': 'off',
      
      // TypeScript specific rules
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      
      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      
      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off',
      
      // Import ordering
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      
      // Disable conflicting import rules
      'import/named': 'off',
      'import/namespace': 'off',
      'import/default': 'off',
      'import/no-named-as-default-member': 'off',

      // JSDoc validation (STRICT MODE) - ensures docs stay in sync with code
      // CRITICAL: These rules ensure that if a function signature changes, the JSDoc must also change
      
      // ERROR level - these are the core validation rules that catch doc/code mismatches
      'jsdoc/check-param-names': ['error', { 
        checkDestructured: true,  // Require @param for each destructured property
      }],
      'jsdoc/check-tag-names': ['error', { 
        definedTags: ['packageDocumentation', 'defaultValue', 'internal', 'see', 'category']
      }],
      'jsdoc/valid-types': 'error',
      
      // WARN level - these encourage complete documentation but don't block builds
      // These can be upgraded to 'error' incrementally as documentation is added
      'jsdoc/require-param': ['warn', { 
        checkDestructured: true,
        checkDestructuredRoots: true,
      }],
      'jsdoc/require-param-description': 'warn',
      'jsdoc/require-returns': ['warn', { 
        checkGetters: false,
      }],
      'jsdoc/require-returns-description': 'warn',
      'jsdoc/require-jsdoc': ['warn', {
        require: {
          FunctionDeclaration: true,
          MethodDefinition: false,
          ClassDeclaration: true,
          ArrowFunctionExpression: false,
          FunctionExpression: false,
        },
        publicOnly: false,  // Require docs for all functions, not just exported ones
      }],
    },
    settings: {
      react: {
        version: 'detect',
      },
      jsdoc: {
        mode: 'typescript',
      },
    },
  },

  // Relaxed JSDoc rules for test, mock, asset, and UI atom component files
  {
    files: [
      '**/__mocks__/**', 
      '**/__tests__/**', 
      '**/*.test.{ts,tsx}', 
      '**/*.spec.{ts,tsx}',
      '**/assets/**',
      '**/internals/**',
      '**/components/ui/**',  // shadcn/atom components - thin wrappers, not public API
    ],
    rules: {
      'jsdoc/require-param': 'off',
      'jsdoc/check-param-names': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-param-description': 'off',
      'jsdoc/require-returns-description': 'off',
    },
  },

  // JavaScript files configuration
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
  },
];