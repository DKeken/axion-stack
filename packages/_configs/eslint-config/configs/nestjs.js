import js from '@eslint/js';
import importX from 'eslint-plugin-import-x';
import sonarjs from 'eslint-plugin-sonarjs';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/**
 * NestJS-specific ESLint configuration
 * Optimized for API development with external service integrations
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

  // Main configuration for TypeScript files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd(),
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'import-x': importX,
      sonarjs: sonarjs,
    },
    rules: {
      // Core TypeScript rules
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      // Unused vars - более мягкое правило
      '@typescript-eslint/no-unused-vars': [
        'warn', // Изменено с 'error' на 'warn'
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          args: 'after-used', // Разрешаем неиспользуемые аргументы
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Naming conventions - отключено полностью для всех TypeScript файлов
      '@typescript-eslint/naming-convention': 'off',

      // Nullish coalescing - отключено, || тоже нормально
      '@typescript-eslint/prefer-nullish-coalescing': 'off',

      // Отключаем проблемные правила полностью
      '@typescript-eslint/no-namespace': 'off',

      // Console statements - предупреждения для main.ts
      'no-console': 'warn',

      // Promise handling - warnings вместо errors
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/await-thenable': 'warn',

      // Destructuring - предупреждение вместо ошибки
      'prefer-destructuring': [
        'warn',
        {
          array: false,
          object: true,
        },
      ],

      // SonarJS rules - смягчение
      'sonarjs/no-duplicate-string': [
        'warn',
        {
          threshold: 10, // Увеличиваем порог с 5 до 10
        },
      ],

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

      // NestJS specific rules
      '@typescript-eslint/no-empty-object-type': [
        'error',
        {
          allowInterfaces: 'with-single-extends', // Разрешаем пустые интерфейсы, которые расширяют другие
        },
      ],
      '@typescript-eslint/no-extraneous-class': 'off', // Отключаем полностью для всех файлов
    },
  },

  // Configuration for JavaScript files
  {
    files: ['**/*.js', '**/*.jsx', '**/*.mjs', '**/*.cjs'],
    languageOptions: {
      globals: {
        ...globals.node,
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
      'sonarjs/cognitive-complexity': ['error', 30],
      'sonarjs/no-duplicate-string': ['error', { threshold: 8 }],

      // General rules
      'no-console': 'warn',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // Main application files - allow console and other setup-specific code
  {
    files: ['**/main.ts', '**/bootstrap.ts', '**/setup.ts'],
    rules: {
      'no-console': 'off', // Разрешаем console в главных файлах
      '@typescript-eslint/no-misused-promises': 'off', // Для setup функций
      '@typescript-eslint/no-floating-promises': 'off', // Для инициализации
    },
  },

  // Configuration files
  {
    files: ['**/config/*.ts', '**/*.config.ts'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/prefer-nullish-coalescing': 'off',
    },
  },

  // Test files configuration
  {
    files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
    rules: {
      // Relaxed rules for test files
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/cognitive-complexity': 'off',
      'no-console': 'off',
    },
  },

  // NestJS services and controllers - relaxed rules for dependency injection
  {
    files: [
      '**/*.service.ts',
      '**/*.controller.ts',
      '**/*.guard.ts',
      '**/*.interceptor.ts',
      '**/*.middleware.ts',
    ],
    rules: {
      '@typescript-eslint/naming-convention': 'off', // Отключаем для DI параметров
      '@typescript-eslint/no-unused-vars': 'warn', // Мягкое правило для инжектированных зависимостей
    },
  },

  // NestJS modules - allow empty classes for configuration modules
  {
    files: ['**/*.module.ts'],
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off', // Разрешаем пустые классы модулей
    },
  },

  // DTO files configuration - more relaxed for external API compatibility
  {
    files: ['**/dto/*.ts', '**/dto/*.tsx', '**/types/*.ts', '**/interfaces/*.ts'],
    rules: {
      '@typescript-eslint/naming-convention': 'off', // Полностью отключаем для DTO
      '@typescript-eslint/no-unused-vars': 'off', // Разрешаем неиспользуемые импорты в типах
    },
  },
];
