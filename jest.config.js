export default {
  preset: 'ts-jest/presets/default-esm',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/launch/**',
    '!src/**/*.spec.ts',
    '!src/**/index.ts',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'target/coverage',
  coverageThreshold: {
    global: 100,
  },
  extensionsToTreatAsEsm: ['.ts'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        suiteName: '@sqdn/squadron',
        outputDirectory: './target/test-results',
        classNameTemplate: '{classname}: {title}',
        titleTemplate: '{classname}: {title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: 'true',
      },
    ],
  ],
  testEnvironment: 'node',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.spec.json',
      useESM: true,
    },
  },
};
