module.exports = wallaby => ({
  files: ['src/**/*.ts'],

  tests: ['spec/**/*.ts'],

  testFramework: {
    type: 'jest'
  },

  env: {
    type: 'node'
  },

  workers: {
    initial: 1,
    regular: 1
  },

  setup: function(w) {
    jestConfig = {
      resetMocks: true,
      resetModules: true,
      clearMocks: true
    };

    w.testFramework.configure(jestConfig);
  }
});
