import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,

  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module', // ✅ ES Modules
      globals: {
        ...globals.node,
      },
    },

    rules: {
      // Express backend-friendly rules
      'no-console': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: 'next' }],
      'consistent-return': 'off',
      'no-underscore-dangle': 'off',
      'linebreak-style': 'off',
    },
  },
];
