module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    'react-native/no-inline-styles': 0,
    'prettier/prettier': 0,
  },
  overrides: [
    {
      files: ['*.js', '*.tsx'],
      rules: {
        'no-shadow': 'off',
        'no-undef': 'off',
        'no-control-regex': 'off',
        'react-hooks/exhaustive-deps': 'off',
        'react-hooks/rules-of-hooks': 'off',
      },
    },
  ],
};
