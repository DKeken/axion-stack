import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

import baseConfig from './base.js';

/**
 * ESLint configuration specialized for React applications
 * Extends base config with React, JSX, and accessibility rules
 */
export default [
  ...baseConfig,

  // React and JSX configuration
  {
    files: ['**/*.tsx', '**/*.jsx'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd(),
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: 'readonly',
        JSX: 'readonly',
      },
    },
    plugins: {
      react: react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    settings: {
      react: {
        version: 'detect',
        pragma: 'React',
        fragment: 'Fragment',
      },
    },
    rules: {
      // React Rules
      ...react.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off', // Not needed with new JSX transform
      'react/jsx-uses-react': 'off', // Not needed with new JSX transform
      'react/prop-types': 'off', // Using TypeScript for type checking
      'react/display-name': 'warn',
      'react/no-array-index-key': 'warn',
      'react/no-deprecated': 'error',
      'react/no-direct-mutation-state': 'error',
      'react/no-unsafe': 'error',
      'react/jsx-fragments': ['error', 'syntax'],
      'react/jsx-no-useless-fragment': 'error',
      'react/jsx-curly-brace-presence': [
        'error',
        {
          props: 'never',
          children: 'never',
        },
      ],
      'react/jsx-boolean-value': ['error', 'never'],
      'react/self-closing-comp': 'error',
      'react/jsx-sort-props': [
        'error',
        {
          callbacksLast: true,
          shorthandFirst: true,
          reservedFirst: true,
        },
      ],

      // React Hooks Rules
      ...reactHooks.configs.recommended.rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // JSX Accessibility Rules
      ...jsxA11y.configs.recommended.rules,
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/anchor-has-content': 'error',
      'jsx-a11y/anchor-is-valid': 'error',
      'jsx-a11y/aria-props': 'error',
      'jsx-a11y/aria-proptypes': 'error',
      'jsx-a11y/aria-role': 'error',
      'jsx-a11y/aria-unsupported-elements': 'error',
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/heading-has-content': 'error',
      'jsx-a11y/iframe-has-title': 'error',
      'jsx-a11y/img-redundant-alt': 'error',
      'jsx-a11y/interactive-supports-focus': 'error',
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/media-has-caption': 'warn',
      'jsx-a11y/mouse-events-have-key-events': 'error',
      'jsx-a11y/no-access-key': 'error',
      'jsx-a11y/no-autofocus': 'warn',
      'jsx-a11y/no-distracting-elements': 'error',
      'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
      'jsx-a11y/no-noninteractive-element-interactions': 'error',
      'jsx-a11y/no-noninteractive-element-to-interactive-role': 'error',
      'jsx-a11y/no-redundant-roles': 'error',
      'jsx-a11y/no-static-element-interactions': 'error',
      'jsx-a11y/role-has-required-aria-props': 'error',
      'jsx-a11y/role-supports-aria-props': 'error',
      'jsx-a11y/scope': 'error',
      'jsx-a11y/tabindex-no-positive': 'error',

      // TypeScript adjustments for React
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_|^React$',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Import adjustments for React
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', ['internal', 'parent', 'sibling'], 'index', 'type'],
          'newlines-between': 'always',
          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before',
            },
            {
              pattern: 'react-*',
              group: 'external',
              position: 'before',
            },
            {
              pattern: '@/**',
              group: 'internal',
              position: 'before',
            },
          ],
          pathGroupsExcludedImportTypes: ['react', 'type'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      // Naming conventions for React components - отключено по запросу
      '@typescript-eslint/naming-convention': 'off',

      // Performance and best practices
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-destructuring': 'error',

      // Adjusted complexity for React components
      'sonarjs/cognitive-complexity': ['error', 30], // React components can be more complex
      'sonarjs/no-duplicate-string': ['error', { threshold: 6 }],
    },
  },

  // Configuration for React test files
  {
    files: [
      '**/*.test.tsx',
      '**/*.test.jsx',
      '**/*.spec.tsx',
      '**/*.spec.jsx',
      '**/__tests__/**/*.tsx',
      '**/__tests__/**/*.jsx',
    ],
    rules: {
      // Test-specific relaxations
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/cognitive-complexity': 'off',
      'jsx-a11y/no-autofocus': 'off',
      'jsx-a11y/no-static-element-interactions': 'off',
      'jsx-a11y/click-events-have-key-events': 'off',
      'react/display-name': 'off',
      'no-console': 'off',

      // Allow more flexible patterns in tests
      '@typescript-eslint/no-unused-expressions': 'off',
      'react/jsx-no-useless-fragment': 'off',
    },
  },

  // Configuration for Storybook files
  {
    files: ['**/*.stories.tsx', '**/*.stories.jsx', '**/*.story.tsx', '**/*.story.jsx'],
    rules: {
      // Storybook-specific relaxations
      'sonarjs/no-duplicate-string': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'react/jsx-sort-props': 'off',
      'import-x/no-anonymous-default-export': 'off',
      'no-console': 'off',
    },
  },

  // Configuration for TypeScript only files in React projects
  {
    files: ['**/*.ts'],
    rules: {
      // Keep strict rules for non-React TypeScript files - naming-convention отключено
      '@typescript-eslint/naming-convention': 'off',
    },
  },
];
