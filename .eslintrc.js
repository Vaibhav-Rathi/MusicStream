module.exports = {
    extends: 'next/core-web-vitals',
    ignorePatterns: ['app/generated/**/*'], 
    rules: {
    },
    overrides: [
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
    ],
  };