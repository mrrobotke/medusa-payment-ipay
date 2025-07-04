const { loadEnv } = require("@medusajs/framework/utils")
loadEnv("test", process.cwd())

module.exports = {
  transform: {
    "^.+\\.[jt]s$": [
      "@swc/jest",
      {
        jsc: {
          parser: { syntax: "typescript", decorators: true },
        },
      },
    ],
  },
  testEnvironment: "node",
  moduleFileExtensions: ["js", "ts", "json"],
  modulePathIgnorePatterns: ["dist/"],
  setupFiles: ["./integration-tests/setup.js"],
  detectOpenHandles: true,
  collectCoverageFrom: [
    "src/**/*.{js,ts}",
    "!src/**/__tests__/**",
    "!src/**/*.test.{js,ts}",
    "!src/**/*.spec.{js,ts}",
    "!**/node_modules/**",
    "!**/dist/**"
  ],
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0
    }
  },
}

if (process.env.TEST_TYPE === "integration:http") {
  module.exports.testMatch = ["**/integration-tests/http/*.spec.[jt]s"]
} else if (process.env.TEST_TYPE === "integration:modules") {
  module.exports.testMatch = [
    "**/src/modules/*/__tests__/**/*.[jt]s",
    "**/src/providers/*/__tests__/**/*.integration.spec.[jt]s"
  ]
} else if (process.env.TEST_TYPE === "unit") {
  module.exports.testMatch = ["**/src/**/__tests__/**/*.unit.spec.[jt]s"]
} 