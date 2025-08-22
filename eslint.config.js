/**
 * Root ESLint configuration for the monorepo
 * Uses @repo/eslint-config package for consistent linting across all projects
 * @type {import('eslint').Linter.Config[]}
 */

import { createBaseConfig, createNestJSConfig, createReactConfig } from '@repo/eslint-config';

export default [
  // Ignore patterns for the entire monorepo
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/*.min.js',
      '**/*.bundle.js',
      '**/public/**',
      '**/static/**',
      '**/paraglide/**',
      '**/.nitro/**',
      '**/app/paraglide/**',
      '**/src/paraglide/**',
      '**/styles/hero.js',
    ],
  },

  // Base configuration for all TypeScript/JavaScript files
  ...createBaseConfig(),

  // NestJS-specific configuration for backend apps
  ...createNestJSConfig().map((config) => ({
    ...config,
    files: [
      'apps/gateway/**/*.{ts,js}',
      'apps/auth-service/**/*.{ts,js}',
      'apps/user-service/**/*.{ts,js}',
      'packages/infrastructure/**/*.{ts,js}',
      'packages/database/**/*.{ts,js}',
      'packages/common/**/*.{ts,js}',
      'packages/contracts/**/*.{ts,js}',
    ],
  })),

  // React-specific configuration for client apps
  ...createReactConfig().map((config) => ({
    ...config,
    files: ['apps/web/**/*.{ts,tsx,js,jsx}'],
  })),

  // Playwright-specific configuration (separate from NestJS)
  ...createBaseConfig().map((config) => ({
    ...config,
    files: ['apps/playwright/**/*.{ts,js}'],
    languageOptions: {
      ...config.languageOptions,
      parserOptions: {
        ...config.languageOptions?.parserOptions,
        project: ['apps/playwright/tsconfig.json'],
        tsconfigRootDir: process.cwd(),
      },
    },
  })),

  // Package-specific configurations - TypeScript files only
  ...createBaseConfig().map((config) => ({
    ...config,
    files: ['packages/**/*.{ts,tsx}'],
  })),

  // Package JavaScript files (without TypeScript parsing)
  {
    files: ['packages/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        globalThis: false,
        console: false,
        process: false,
        Buffer: false,
        __dirname: false,
        __filename: false,
        module: false,
        require: false,
        exports: false,
      },
    },
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // Configuration files should use base config only (without TypeScript parsing)
  {
    files: ['*.config.{js,mjs}', '**/*.config.{js,mjs}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        globalThis: false,
        console: false,
        process: false,
      },
    },
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'error',
      'prefer-const': 'error',
    },
  },
];
