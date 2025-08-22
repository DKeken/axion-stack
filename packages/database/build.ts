/// <reference types="bun-types" />

import { $ } from 'bun';
import dts from 'bun-plugin-dtsx';

await $`rm -rf dist`;

const result = await Bun.build({
  entrypoints: ['src/index.ts', 'src/generated/zod/index.ts'],
  outdir: './dist',
  target: 'node',
  external: ['@prisma/client', 'zod'],
  plugins: [
    dts({
      // @ts-expect-error - plugin types are incorrect
      root: './src',
      outdir: './dist',
    }),
  ],
});

if (!result.success) {
  console.error('Build failed');
  for (const message of result.logs) {
    console.error(message);
  }
  process.exit(1);
}

console.log('✅ Build complete with types generated');
