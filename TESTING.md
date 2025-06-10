# Testing Documentation for iPay Payment Plugin

This document provides comprehensive information about testing the iPay payment plugin for Medusa.

## Overview

The iPay payment plugin includes both unit tests and integration tests to ensure reliability and proper functionality. The testing setup follows Medusa's official testing guidelines and uses Jest as the testing framework.

## Test Structure

```
medusa-payment-ipay/
├── src/
│   └── providers/
│       └── ipay/
│           └── __tests__/
│               └── service.test.ts          # Unit tests for payment service
├── integration-tests/
│   └── http/
│       └── webhook.spec.ts                  # Integration tests for webhook API
├── jest.config.js                          # Jest configuration
├── jest.setup.js                          # Test setup and utilities
└── TESTING.md                             # This file
```

## Prerequisites

1. **Node.js** version 18 or higher
2. **npm** or **yarn** package manager
3. **PostgreSQL** database for integration tests
4. **Medusa CLI** installed globally

## Installation

Install all dependencies including test utilities:

```bash
npm install
```

This will install:
- `jest` - Testing framework
- `@types/jest` - TypeScript definitions for Jest
- `@swc/jest` - Fast TypeScript/JavaScript transpiler for Jest
- `@medusajs/test-utils` - Medusa's testing utilities

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### HTTP Integration Tests
```bash
npm run test:integration:http
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Categories

### Unit Tests (`src/providers/ipay/__tests__/service.test.ts`)

Tests the core payment provider service functionality:

- **Constructor Tests**: Validates proper initialization and option validation
- **Payment Initiation**: Tests payment session creation and parameter handling
- **Payment Authorization**: Tests payment authorization flow
- **Payment Capture**: Tests payment capture functionality
- **Payment Cancellation**: Tests payment cancellation
- **Refund Processing**: Tests refund functionality
- **Payment Status**: Tests status retrieval and mapping
- **Error Handling**: Tests graceful error handling
- **Hash Generation**: Tests security hash generation

**Key Test Scenarios:**
- Valid payment initiation with all required parameters
- Live vs test mode handling
- Missing or invalid configuration
- Different payment statuses and their mappings
- Error scenarios and recovery

### Integration Tests (`integration-tests/http/webhook.spec.ts`)

Tests the webhook API endpoints that handle iPay callbacks:

- **POST Webhooks**: Tests webhook payload processing
- **GET Callbacks**: Tests URL callback handling
- **Error Handling**: Tests malformed payloads and edge cases
- **Security**: Tests XSS and injection attack prevention
- **Performance**: Tests concurrent requests and response times

**Key Test Scenarios:**
- Successful payment webhooks with status `aei7p7yrx4ae34`
- Pending payment webhooks with status `bdi6p2yy76etrs`
- Failed payment webhooks with status `cr5i3ku5ecko23`
- Malformed and missing data handling
- Security vulnerability tests
- Concurrent webhook processing

## Test Configuration

### Jest Configuration (`jest.config.js`)

The Jest configuration includes:
- TypeScript support via SWC transpilation
- Test environment setup for Node.js
- Coverage reporting with thresholds (70% minimum)
- Module name mapping for imports
- Test timeout configuration (60 seconds)

### Test Setup (`jest.setup.js`)

Provides global test utilities:
- Environment variable setup
- Mock helper functions
- Hash generation utilities
- Mock data creators

## Mock Data and Utilities

### Global Test Helpers

Available via `global.testHelpers`:

```javascript
// Generate test hash for security validation
generateTestHash(data, key)

// Create mock payment context
createMockPaymentContext(overrides)

// Create mock plugin options
createMockOptions(overrides)
```

### Webhook Test Data

The integration tests include utilities for creating realistic webhook payloads:

```javascript
// Create webhook payload with specific status
createWebhookPayload(status, overrides)

// Generate valid hash for webhook validation
generateTestHash(data, key)
```

## Testing Best Practices

### 1. Isolated Tests
Each test is independent and doesn't rely on external state or previous test results.

### 2. Comprehensive Coverage
Tests cover:
- Happy path scenarios
- Error conditions
- Edge cases
- Security vulnerabilities
- Performance characteristics

### 3. Realistic Test Data
Tests use realistic data that matches iPay's actual webhook format and requirements.

### 4. Mocking External Dependencies
External API calls and database operations are mocked to ensure test reliability and speed.

### 5. Clear Test Descriptions
Test names clearly describe what functionality is being tested and what the expected outcome is.

## Environment Setup for Testing

### Required Environment Variables

```bash
# Test environment
NODE_ENV=test

# Database (for integration tests)
DATABASE_URL=postgresql://username:password@localhost:5432/medusa_test

# iPay configuration (test values)
IPAY_VID=test_vid
IPAY_HASH_KEY=test_hash_key
IPAY_LIVE=false
```

### Test Database Setup

For integration tests, you need a PostgreSQL test database:

```bash
# Create test database
createdb medusa_test

# Run Medusa migrations
npx medusa db:migrate
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:13
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: medusa_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/medusa_test
```

## Debugging Tests

### Running Specific Tests

```bash
# Run specific test file
npx jest src/providers/ipay/__tests__/service.test.ts

# Run specific test case
npx jest -t "should initiate payment successfully"

# Run tests with verbose output
npx jest --verbose

# Run tests with debugging info
npx jest --detectOpenHandles --forceExit
```

### Debug Mode

```bash
# Run tests in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand

# Then connect Chrome DevTools to debug
# Go to chrome://inspect in Chrome browser
```

## Coverage Reports

Coverage reports are generated in the `coverage/` directory and include:
- Line coverage
- Branch coverage
- Function coverage
- Statement coverage

View the HTML report by opening `coverage/lcov-report/index.html` in a browser.

### Coverage Thresholds

The project maintains minimum coverage thresholds of 70% for:
- Branches
- Functions
- Lines
- Statements

## Common Issues and Solutions

### 1. Database Connection Issues
```bash
# Ensure PostgreSQL is running
brew services start postgresql  # macOS
sudo systemctl start postgresql  # Linux

# Check connection
psql -h localhost -U postgres -d medusa_test
```

### 2. Port Conflicts
If tests fail due to port conflicts, ensure no other Medusa instances are running:
```bash
# Kill any running Medusa processes
pkill -f medusa
```

### 3. Module Resolution Issues
If imports fail, ensure TypeScript paths are correctly configured in `tsconfig.json`.

### 4. Timeout Issues
For slow tests, increase timeout in `jest.config.js` or individual test files:
```javascript
jest.setTimeout(120000); // 2 minutes
```

## Writing New Tests

### Unit Test Template

```javascript
describe("NewFeature", () => {
  beforeEach(() => {
    // Setup code
  });

  it("should handle specific scenario", async () => {
    // Arrange
    const input = { /* test data */ };
    
    // Act
    const result = await service.newMethod(input);
    
    // Assert
    expect(result).toEqual(expectedOutput);
  });
});
```

### Integration Test Template

```javascript
medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("New API Endpoint", () => {
      it("should respond correctly", async () => {
        const response = await api.post("/new-endpoint", payload);
        
        expect(response.status).toEqual(200);
        expect(response.data).toEqual(expectedResponse);
      });
    });
  },
});
```

## Performance Testing

### Benchmark Tests

The integration tests include performance benchmarks:
- Webhook processing should complete within 5 seconds
- Concurrent requests should be handled properly
- Memory usage should remain stable

### Load Testing

For production readiness, consider additional load testing:

```bash
# Install artillery for load testing
npm install -g artillery

# Create load test configuration
# Run load tests against staging environment
artillery run load-test-config.yml
```

## Security Testing

The test suite includes security validation:
- XSS attack prevention
- SQL injection prevention
- Hash validation
- Input sanitization

## Documentation Updates

When adding new tests:
1. Update this documentation
2. Add comments explaining complex test scenarios
3. Update coverage thresholds if needed
4. Document any new test utilities or helpers

## Support

For testing-related issues:
1. Check this documentation first
2. Review Jest documentation: https://jestjs.io/docs/getting-started
3. Review Medusa testing docs: https://docs.medusajs.com/learn/testing
4. Create an issue in the project repository

---

**Note**: Always run the full test suite before submitting pull requests to ensure all functionality works correctly. 