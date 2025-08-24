import { base } from '@repo/eslint-config';

export default [
  ...base,
  {
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      'no-console': 'off',
    },
  },
];
