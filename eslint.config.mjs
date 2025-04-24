import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';

// ESLint flat config requires using `__dirname` which is not available in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a compatibility layer between new flat config and traditional config
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Use the recommended JS rules
  js.configs.recommended,

  // Import your existing configuration
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // Add ignores (replacement for .eslintignore)
  {
    ignores: ['app/generated/**/*'],
  },

  // Add overrides for specific files if needed
  {
    files: ['app/generated/**/*'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-wrapper-object-types': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
    },
  },
];
