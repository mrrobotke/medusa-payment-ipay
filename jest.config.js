const { pathsToModuleNameMapper } = require('ts-jest');

module.exports = {
  displayName: "iPay Payment Plugin",
  testEnvironment: "node",
  preset: "ts-jest",
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },
  testPathIgnorePatterns: ["/node_modules/", "<rootDir>/dist/"],
  collectCoverageFrom: [
    "src/providers/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/__tests__/**",
    "!src/**/__mocks__/**",
    "!src/**/index.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    "src/providers/**/*.ts": {
      branches: 70,
      functions: 90,
      lines: 85,
      statements: 85,
    },
  },
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"],
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^~/(.*)$": "<rootDir>/$1",
  },
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.(test|spec).{ts,tsx}",
    "<rootDir>/integration-tests/**/*.(test|spec).{ts,tsx}",
  ],
  moduleDirectories: ["node_modules", "<rootDir>/src"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  verbose: true,
  silent: false,
  bail: false,
  forceExit: true,
  detectOpenHandles: true,
  testTimeout: 60000,
}; 