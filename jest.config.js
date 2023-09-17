const { compilerOptions } = require('./tsconfig');
const { pathsToModuleNameMapper } = require('ts-jest');

module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@config(.*)$': '<rootDir>/src/config$1',
    '^@controllers(.*)$': '<rootDir>/src/controllers$1',
    '^@common(.*)$': '<rootDir>/src/common$1',
    '^@entities(.*)$': '<rootDir>/src/entities$1',
    '^@middleware(.*)$': '<rootDir>/src/common/middleware$1',
    '^@migrations(.*)$': '<rootDir>/src/migrations$1',
    '^@models(.*)$': '<rootDir>/src/models$1',
    '^@enums(.*)$': '<rootDir>/src/enums$1',
    '^@repositories(.*)$': '<rootDir>/src/repositories$1',
    '^@services(.*)$': '<rootDir>/src/services$1',
    '^@utils(.*)$': '<rootDir>/src/common/utils$1',
  },
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/__tests__/**/*.spec.[jt]s?(x)',
    '**/src/**/*.spec.[jt]s?(x)',
    '!**/__tests__/coverage/**',
    '!**/__tests__/utils/**',
    '!**/__tests__/images/**',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/coverage/', '/images/'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
  verbose: false,
};
