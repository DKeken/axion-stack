module.exports = {
  extends: ['../../eslint.config.js'],
  overrides: [
    {
      files: ['load-tests/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
      },
      parserOptions: {
        project: null,
      },
    },
  ],
};
