import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginPrettier from 'eslint-plugin-prettier';

/**
 * Prettier integration configuration for ESLint
 * This should be included last in the configuration array
 *
 * Note: Prettier settings are read from .prettierrc.js in the root
 * to avoid duplication and conflicts between ESLint and Prettier configurations
 */
export default [
  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      // Enable Prettier as an ESLint rule
      // Settings will be automatically read from .prettierrc.js
      'prettier/prettier': 'error',
    },
  },

  // Disable conflicting ESLint rules - this must be last
  eslintConfigPrettier,
];
