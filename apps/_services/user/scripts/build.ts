import { $ } from 'bun';

// Building User Service

try {
  // Clean dist directory
  await $`rm -rf dist`;

  // Run TypeScript compiler
  await $`tsc`;

  // User Service build completed successfully
} catch (error) {
  // Build failed
  process.exit(1);
}
