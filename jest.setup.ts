// Jest setup file for iPay Payment Plugin tests
import crypto from 'crypto';

// Set up environment variables for testing
process.env.NODE_ENV = 'test';

// Type declarations for global test helpers
declare global {
  var testHelpers: {
    generateTestHash: (data: string, key: string) => string;
    createMockPaymentContext: (overrides?: any) => any;
    createMockOptions: (overrides?: any) => any;
  };
}

// Add custom matchers or global test utilities here
global.testHelpers = {
  generateTestHash: (data: string, key: string) => {
    return crypto.createHmac('sha1', key).update(data).digest('hex');
  },
  
  createMockPaymentContext: (overrides = {}) => ({
    amount: 1000,
    currency_code: 'KES',
    resource_id: 'order_test_123',
    customer: {
      id: 'cus_test_123',
      email: 'test@example.com',
    },
    billing_address: {
      first_name: 'Test',
      last_name: 'User',
      phone: '+254700000000',
    },
    ...overrides,
  }),
  
  createMockOptions: (overrides = {}) => ({
    vid: 'test_vid',
    hash_key: 'test_hash_key',
    live: false,
    callback_url: 'https://test.example.com/callback',
    channels: {
      mpesa: true,
      airtel: true,
      card: true,
      pesalink: true,
    },
    ...overrides,
  }),
};

// Set longer timeout for integration tests - this will be handled by Jest config instead 