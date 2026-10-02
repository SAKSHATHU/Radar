/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: { '\\.(css)$': 'identity-obj-proxy' },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },
};
