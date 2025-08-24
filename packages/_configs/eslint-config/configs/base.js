import js from '@eslint/js';
import importX from 'eslint-plugin-import-x';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * Base ESLint configuration with TypeScript support
 * Modern, strict, and performance-optimized setup
 */
export default [
  // Global ignores
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/generated/**',
      '**/*.min.js',
      '**/.env*',
      '**/package-lock.json',
      '**/bun.lockb',
      '**/yarn.lock',
      '**/prisma/migrations/**',
    ],
  },

  // Base JavaScript configuration
  js.configs.recommended,

  // TypeScript configuration
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,

  // Configuration for TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.es2022,
      },
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd(),
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'import-x': importX,
      sonarjs: sonarjs,
    },
    rules: {
      // ===== STRICT TYPE SAFETY RULES (HIGH PRIORITY) =====
      // Запрет небезопасных конструкций с any
      '@typescript-eslint/no-explicit-any': 'error', // Запрет any (было warn)
      '@typescript-eslint/no-unsafe-assignment': 'error', // Запрет присваивания any
      '@typescript-eslint/no-unsafe-call': 'error', // Запрет вызова any
      '@typescript-eslint/no-unsafe-member-access': 'error', // Запрет доступа к свойствам any
      '@typescript-eslint/no-unsafe-return': 'error', // Запрет возврата any
      '@typescript-eslint/no-unsafe-argument': 'error', // Запрет передачи any в аргументы

      // Контроль type assertions - ЗАПРЕЩАЕМ ВСЕ as unknown as и подобные
      '@typescript-eslint/consistent-type-assertions': [
        'error',
        {
          assertionStyle: 'never', // Полный запрет type assertions (as, <Type>)
        },
      ],

      // Запрет опасных конструкций
      '@typescript-eslint/no-non-null-assertion': 'error', // Запрет !
      '@typescript-eslint/ban-ts-comment': 'error', // Запрет @ts-ignore
      // ===== END STRICT TYPE SAFETY RULES =====

      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
          args: 'after-used',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/array-type': ['error', { default: 'array' }],
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-extraneous-class': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-namespace': 'off',

      // Import rules
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import-x/no-unresolved': 'off', // TypeScript handles this
      'import-x/named': 'off', // TypeScript handles this
      'import-x/default': 'off', // TypeScript handles this
      'import-x/no-named-as-default-member': 'off', // TypeScript handles this

      // SonarJS rules for complexity management
      'sonarjs/cognitive-complexity': ['warn', 25], // Увеличиваем лимит и делаем warning
      'sonarjs/no-duplicate-string': ['warn', { threshold: 8 }], // Увеличиваем порог и делаем warning
      'sonarjs/no-duplicated-branches': 'error',
      'sonarjs/no-identical-functions': 'error',
      'sonarjs/prefer-immediate-return': 'error',
      'sonarjs/prefer-object-literal': 'error',
      'sonarjs/prefer-single-boolean-return': 'error',

      // General rules
      'no-console': 'off',
      'no-debugger': 'error',
      'no-alert': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'prefer-destructuring': 'error',
      'no-duplicate-imports': 'error',
      'no-useless-rename': 'error',
      // Убрано 'sort-imports' так как конфликтует с 'import-x/order'
    },
  },

  // Configuration for JavaScript files
  {
    files: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        ...globals.es2022,
      },
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    plugins: {
      'import-x': importX,
      sonarjs: sonarjs,
    },
    rules: {
      // Relaxed rules for JavaScript files
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-var-requires': 'off',

      // Import rules
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      // SonarJS rules
      'sonarjs/cognitive-complexity': ['error', 25],
      'sonarjs/no-duplicate-string': ['error', { threshold: 6 }],

      // General rules
      'no-console': 'off',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // Test files configuration
  {
    files: [
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/load-tests/**/*.ts',
      '**/tests/**/*.ts',
    ],
    rules: {
      // Relaxed rules for test files and load tests
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/consistent-type-assertions': 'off', // Разрешаем type assertions в тестах
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/cognitive-complexity': 'off',
      'no-console': 'off',
    },
  },
];
