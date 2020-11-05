const isWallaby = !!process.env.WALLABY_ENV;

module.exports = {
  "preset": "ts-jest",
  "testMatch": [
    "**/spec/**/*-spec.ts"
  ],
  "globals": {
    "ts-jest": {
      "diagnostics": false
    }
  },
  "bail": true,
  "testEnvironment": "node",
  "moduleFileExtensions": [
    "js",
    "jsx",
    "json",
    "ts",
    "tsx"
  ],
  "testPathIgnorePatterns": [
    "/.tmp/"
  ],
  "coverageReporters": [
    "lcov"
  ],
  reporters: !isWallaby ? [ "jest-spin-reporter" ] : undefined,
  "collectCoverageFrom": [
    "src/**/*.{ts, tsx}",
    "!**/*.d.ts"
  ],
  "coveragePathIgnorePatterns": [
    "<rootDir>/node_modules/",
    "<rootDir>/spec/.*\\.(ts|js)$",
    "<rootDir>/build/.*\\.(ts|js)$",
    "<rootDir>/src/RxSandbox.ts",
    "<rootDir>/src/RxSandboxInstance.ts"
  ]
}