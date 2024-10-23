// @ts-check
const {resolve} = require('node:path');
const {defineConfig} = require('eslint-define-config');

/// <reference types="@eslint-types/typescript-eslint" />

module.exports = defineConfig({
  parser: '@typescript-eslint/parser',
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint/eslint-plugin'],
  env: {node: true},
  settings: {
    'import/resolver': {
      typescript: {project: resolve(process.cwd(), 'tsconfig.json')},
    },
  },
  ignorePatterns: ['.*.js', 'dist/', 'node_modules/', 'tests/'],
  overrides: [{files: ['*.js?(x)', '*.ts?(x)']}],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
  },
});
