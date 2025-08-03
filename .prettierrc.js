/**
 * Prettier configuration for the entire monorepo
 * This configuration is shared across all packages and applications
 */
export default {
  // Core formatting options
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 100,

  // Bracket and spacing options
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',

  // Line ending and quotes
  endOfLine: 'lf',
  quoteProps: 'as-needed',
  jsxSingleQuote: true,

  // Language-specific formatting
  proseWrap: 'preserve',
  htmlWhitespaceSensitivity: 'css',
  vueIndentScriptAndStyle: false,
  embeddedLanguageFormatting: 'auto',

  // Import handling - оставляем импорты как есть, пусть ESLint их сортирует
  // Note: importOrder options removed as they require a plugin like @trivago/prettier-plugin-sort-imports

  // File-specific overrides
  overrides: [
    {
      files: '*.json',
      options: {
        tabWidth: 2,
        printWidth: 120,
      },
    },
    {
      files: '*.md',
      options: {
        tabWidth: 2,
        proseWrap: 'always',
        printWidth: 80,
      },
    },
    {
      files: '*.yml',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
    {
      files: '*.yaml',
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
  ],
};
