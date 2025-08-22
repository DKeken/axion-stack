/// <reference types="bun-types" />

import { $ } from 'bun';

await $`rm -rf dist`;

// Packages that should always be treated as external for Bun bundling.
// This avoids Bun trying to resolve deep, non-exported subpaths like
// "class-transformer/storage" referenced by some Nest helpers.
const alwaysExternalPackages = [
  'class-transformer',
  'class-transformer/storage',
  'class-validator',
];

// Optional packages that may or may not be installed depending on
// runtime configuration. If not installed, mark them external so the build succeeds.
const optionalRequirePackages = ['@nestjs/microservices', '@nestjs/websockets', '@fastify/static'];

const result = await Bun.build({
  entrypoints: ['./src/main.ts'],
  outdir: './dist',
  target: 'bun',
  minify: {
    syntax: true,
    whitespace: true,
  },
  external: [
    ...alwaysExternalPackages,
    ...optionalRequirePackages.filter((pkg) => {
      try {
        Bun.resolveSync(pkg, process.cwd());
        return false;
      } catch (_) {
        return true;
      }
    }),
  ],
  splitting: true,
});

if (!result.success) {
  process.exit(1);
}
