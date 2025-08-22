import { $ } from 'bun';

console.log('🔨 Building User Service...');

try {
  // Clean dist directory
  await $`rm -rf dist`;

  // Run TypeScript compiler
  await $`tsc`;

  console.log('✅ User Service build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
