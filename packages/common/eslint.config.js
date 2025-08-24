/**
 * Backend ESLint configuration
 * Uses the shared @repo/eslint-config package with NestJS-specific rules
 */

import { createNestJSConfig } from '@repo/eslint-config';

export default [
  // Apply NestJS configuration to all files in the backend
  ...createNestJSConfig(),
];
