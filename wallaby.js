module.exports = (_wallaby) => ({
  files: ['src/**/*.ts'],

  tests: ['spec/**/*.ts'],

  env: {
    type: 'node',
  },
});
