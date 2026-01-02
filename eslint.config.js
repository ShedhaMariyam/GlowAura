import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: [
      'node_modules/**',
      'public/**',   // browser JS
      'uploads/**',
      'dist/**',
    ],
  },

  js.configs.recommended,

  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },

    rules: {
      'no-console': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: 'next|error|err' }],
      'consistent-return': 'off',
      'no-underscore-dangle': 'off',
      'linebreak-style': 'off',
      'no-empty': 'warn', // don’t fail build
    },
  },
];
