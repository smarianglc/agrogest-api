const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
  { ignores: ['node_modules/'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      // req, res e next fazem parte da assinatura do Express, mesmo quando não são usados
      'no-unused-vars': ['error', { argsIgnorePattern: '^(_|req|res|next)$' }],
    },
  },
];
