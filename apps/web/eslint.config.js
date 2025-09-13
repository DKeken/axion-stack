/**
 * Backend ESLint configuration
 * Uses the shared @repo/eslint-config package with NestJS-specific rules
 */

import { createReactConfig } from '@repo/eslint-config';

export default [
  // Apply React configuration to all files in the web app
  ...createReactConfig(),
  // Ignore generated paraglide files and nitro files
  {
    ignores: ['src/paraglide/**/*', '.nitro/**/*', 'src/components/ui/**/*'],
  },
];
