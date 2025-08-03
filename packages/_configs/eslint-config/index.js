/**
 * @repo/eslint-config
 *
 * Modern ESLint configuration package for TypeScript monorepo
 * Supports NestJS, React, and general TypeScript projects
 *
 * Features:
 * - ESLint 9 with flat configuration
 * - TypeScript support with strict rules
 * - Prettier integration
 * - Import sorting and organization
 * - Code complexity management with SonarJS
 * - React and JSX support with accessibility rules
 * - NestJS decorators and DI patterns support
 */

// Import configurations for internal use
import base from './configs/base.js';
import nestjs from './configs/nestjs.js';
import prettier from './configs/prettier.js';
import react from './configs/react.js';

// Export all configurations
export { base, nestjs, react, prettier };

// Utility functions for easier configuration
export function defineConfig(...configs) {
  return configs.flat();
}

/**
 * Create a base configuration with Prettier
 * @param {Object} options - Configuration options
 * @returns {Array} ESLint configuration array
 */
export function createBaseConfig(options = {}) {
  const { withPrettier = true } = options;

  const configs = [];
  configs.push(...base);

  if (withPrettier) {
    configs.push(...prettier);
  }

  return configs;
}

/**
 * Create a NestJS configuration with Prettier
 * @param {Object} options - Configuration options
 * @returns {Array} ESLint configuration array
 */
export function createNestJSConfig(options = {}) {
  const { withPrettier = true } = options;

  const configs = [];
  configs.push(...nestjs);

  if (withPrettier) {
    configs.push(...prettier);
  }

  return configs;
}

/**
 * Create a React configuration with Prettier
 * @param {Object} options - Configuration options
 * @returns {Array} ESLint configuration array
 */
export function createReactConfig(options = {}) {
  const { withPrettier = true } = options;

  const configs = [];
  configs.push(...react);

  if (withPrettier) {
    configs.push(...prettier);
  }

  return configs;
}

/**
 * Predefined configurations for common use cases
 */
export const configs = {
  base: createBaseConfig(),
  nestjs: createNestJSConfig(),
  react: createReactConfig(),

  // Configurations without Prettier (for custom Prettier setups)
  baseOnly: createBaseConfig({ withPrettier: false }),
  nestjsOnly: createNestJSConfig({ withPrettier: false }),
  reactOnly: createReactConfig({ withPrettier: false }),
};

// Default export for easier importing
export default configs;
