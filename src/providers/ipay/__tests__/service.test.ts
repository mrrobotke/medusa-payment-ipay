import { MedusaContainer } from "@medusajs/framework/types";
import crypto from "crypto";
import IPayProviderService from "../service";

// Mock fetch globally
global.fetch = jest.fn();

describe("IPayProviderService", () => {
  let service: IPayProviderService;
  let mockOptions: any;
  let mockContainer: MedusaContainer;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockOptions = {
      vid: 'test_vid',
      hashKey: 'test_hash_key',
      live: false,
      enabledChannels: {
        mpesa: true,
        airtel: true,
        creditcard: true,
        pesalink: true,
      },
    };

    mockContainer = {} as MedusaContainer;
    
    service = new IPayProviderService(mockContainer, mockOptions);
  });

  describe("Static properties", () => {
    it("should have correct identifier", () => {
      expect(IPayProviderService.identifier).toBe("ipay");
    });
  });

  describe("Constructor", () => {
    it("should initialize with correct options", () => {
      expect(service["options_"]).toEqual(mockOptions);
    });
  });

  describe("validateOptions", () => {
    it("should validate required options successfully", () => {
      expect(() => {
        IPayProviderService.validateOptions(mockOptions);
      }).not.toThrow();
    });

    it("should throw error if vid is missing", () => {
      expect(() => {
        IPayProviderService.validateOptions({ hashKey: 'test' });
      }).toThrow("iPay VID is required");
    });

    it("should throw error if hashKey is missing", () => {
      expect(() => {
        IPayProviderService.validateOptions({ vid: 'test' });
      }).toThrow("iPay hash key is required");
    });
  });

  describe("initiatePayment", () => {
    const mockInput = {
      amount: 10000, // 100.00 in cents
      currency_code: 'KES',
      context: {
        customer: {
          email: 'test@example.com',
          phone: '+254700000000',
        },
        order: {
          id: 'order_test_123',
        },
      },
    };

    it("should initiate payment successfully", async () => {
      const result = await service.initiatePayment(mockInput);

      expect(result).toEqual({
        data: expect.objectContaining({
          id: expect.stringContaining('order_'),
          paymentData: expect.objectContaining({
            vid: mockOptions.vid,
            ttl: '100',
            eml: mockInput.context.customer.email,
            tel: mockInput.context.customer.phone,
            curr: 'KES',
            live: '0',
          }),
          gatewayUrl: 'https://www.ipayafrica.com/ipn/',
          status: 'pending',
          amount: 10000,
          currency_code: 'KES',
        }),
      });
    });

    it("should handle live mode correctly", async () => {
      service = new IPayProviderService(mockContainer, { ...mockOptions, live: true });

      const result = await service.initiatePayment(mockInput);

      expect(result.data.paymentData.live).toBe('1');
      expect(result.data.paymentData.cst).toBe('1');
    });

    it("should handle test mode correctly", async () => {
      const result = await service.initiatePayment(mockInput);

      expect(result.data.paymentData.live).toBe('0');
      expect(result.data.paymentData.cst).toBe('0');
    });

    it("should include hash in payment data", async () => {
      const result = await service.initiatePayment(mockInput);

      expect(result.data.paymentData.hsh).toBeDefined();
      expect(typeof result.data.paymentData.hsh).toBe('string');
    });
  });

  describe("authorizePayment", () => {
    it("should authorize payment successfully", async () => {
      const mockInput = {
        data: {
          id: 'order_test_123',
          status: 'pending',
          amount: 10000,
        },
      };

      const result = await service.authorizePayment(mockInput);

      expect(result).toEqual({
        status: 'authorized',
        data: expect.objectContaining({
          id: 'order_test_123',
          status: 'authorized',
          authorized_at: expect.any(String),
        }),
      });
    });
  });

  describe("capturePayment", () => {
    it("should capture payment successfully", async () => {
      const mockInput = {
        data: {
          id: 'order_test_123',
          status: 'authorized',
          amount: 10000,
        },
      };

      const result = await service.capturePayment(mockInput);

      expect(result).toEqual({
        data: expect.objectContaining({
          id: 'order_test_123',
          status: 'captured',
          captured_at: expect.any(String),
        }),
      });
    });
  });

  describe("cancelPayment", () => {
    it("should cancel payment successfully", async () => {
      const mockInput = {
        data: {
          id: 'order_test_123',
          status: 'pending',
        },
      };

      const result = await service.cancelPayment(mockInput);

      expect(result).toEqual({
        data: expect.objectContaining({
          id: 'order_test_123',
          status: 'cancelled',
          cancelled_at: expect.any(String),
        }),
      });
    });
  });

  describe("refundPayment", () => {
    it("should process refund successfully", async () => {
      const mockInput = {
        data: {
          id: 'order_test_123',
          status: 'captured',
          amount: 10000,
        },
        amount: 5000,
      };

      const result = await service.refundPayment(mockInput);

      expect(result).toEqual({
        data: expect.objectContaining({
          id: 'order_test_123',
          refund_requested: true,
          refund_amount: 5000,
          refund_requested_at: expect.any(String),
        }),
      });
    });
  });

  describe("retrievePayment", () => {
    it("should retrieve payment data successfully", async () => {
      const mockInput = {
        data: {
          id: 'order_test_123',
          status: 'captured',
          amount: 10000,
        },
      };

      const result = await service.retrievePayment(mockInput);

      expect(result).toEqual(mockInput.data);
    });

    it("should handle empty input", async () => {
      const result = await service.retrievePayment({});

      expect(result).toEqual({});
    });
  });

  describe("updatePayment", () => {
    it("should update payment successfully", async () => {
      const mockInput = {
        amount: 15000,
        currency_code: 'KES',
        data: {
          id: 'order_test_123',
          amount: 10000,
          currency_code: 'KES',
        },
      };

      const result = await service.updatePayment(mockInput);

      expect(result).toEqual(expect.objectContaining({
        id: 'order_test_123',
        amount: 15000,
        currency_code: 'KES',
        updated_at: expect.any(String),
      }));
    });
  });

  describe("deletePayment", () => {
    it("should delete payment successfully", async () => {
      const mockInput = {
        data: {
          id: 'order_test_123',
          status: 'pending',
        },
      };

      const result = await service.deletePayment(mockInput);

      expect(result).toEqual({
        data: mockInput.data,
      });
    });
  });

  describe("getPaymentStatus", () => {
    it("should get payment status successfully", async () => {
      const mockInput = {
        data: {
          id: 'order_test_123',
          status: 'captured',
        },
      };

      const result = await service.getPaymentStatus(mockInput);

      expect(result).toEqual({
        status: 'captured',
      });
    });

    it("should default to pending status", async () => {
      const mockInput = {
        data: {
          id: 'order_test_123',
        },
      };

      const result = await service.getPaymentStatus(mockInput);

      expect(result).toEqual({
        status: 'pending',
      });
    });
  });

  describe("getWebhookActionAndData", () => {
    it("should handle successful payment webhook", async () => {
      const mockPayload = {
        data: {
          status: 'aei7p7yrx4ae34',
          p1: 'order_test_123',
          ttl: '100',
        },
      };

      const result = await service.getWebhookActionAndData(mockPayload);

      expect(result).toEqual({
        action: 'authorized',
        data: {
          session_id: 'order_test_123',
          amount: 10000,
        },
      });
    });

    it("should handle pending payment webhook", async () => {
      const mockPayload = {
        data: {
          status: 'bdi6p2yy76etrs',
          p1: 'order_test_123',
          mc: '100',
        },
      };

      const result = await service.getWebhookActionAndData(mockPayload);

      expect(result).toEqual({
        action: 'not_supported',
        data: {
          session_id: 'order_test_123',
          amount: 10000,
        },
      });
    });
  });

  describe("generateHash (private method)", () => {
    it("should generate correct hash", () => {
      const testData = {
        vid: 'test_vid',
        ttl: '100',
        oid: 'order_123',
        eml: 'test@example.com',
      };

      // Access private method for testing
      const hash = (service as any).generateHash(testData);

      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe("Error handling", () => {
    it("should handle missing context gracefully", async () => {
      const mockInput = {
        amount: 10000,
        currency_code: 'KES',
        context: {},
      };

      const result = await service.initiatePayment(mockInput);

      expect(result.data.paymentData.eml).toBe('');
      expect(result.data.paymentData.tel).toBe('');
    });
  });
}); 