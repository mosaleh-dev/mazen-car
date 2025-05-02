import prettier from 'eslint-plugin-prettier';
import jsdoc from 'eslint-plugin-jsdoc';
import eslintRecommended from '@eslint/js';

export default [
  {
    files: ['**/*.{js}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        browser: true,
        document: true,
      },
    },
    plugins: {
      prettier,
      jsdoc,
    },
    rules: {
      ...eslintRecommended.configs.recommended.rules,
      ...prettier.configs.recommended.rules,
      'prettier/prettier': 'warn',
      'no-unused-vars': 'warn',
      'no-console': 'warn',
    },
    ignores: ['dist', '.eslintrc.cjs'],
  },
];
