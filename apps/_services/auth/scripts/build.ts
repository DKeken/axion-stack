import { $ } from 'bun';

// Building Auth Service

try {
  // Clean dist directory
  await $`rm -rf dist`;

  // Run TypeScript compiler
  await $`tsc`;

  // Auth Service build completed successfully
} catch (error) {
  // Build failed
  process.exit(1);
}
