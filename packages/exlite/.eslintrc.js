/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['@repo/eslint-config/library.js'],
  parserOptions: {
    project: true,
  },
  rules: {
    '@typescript-eslint/no-require-imports': 'off',
  },
};
