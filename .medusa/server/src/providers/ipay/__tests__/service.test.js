"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const service_1 = __importDefault(require("../service"));
// Mock fetch globally
global.fetch = jest.fn();
describe("IPayProviderService", () => {
    let service;
    let mockOptions;
    let mockContainer;
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
        mockContainer = {};
        service = new service_1.default(mockContainer, mockOptions);
    });
    describe("Static properties", () => {
        it("should have correct identifier", () => {
            expect(service_1.default.identifier).toBe("ipay");
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
                service_1.default.validateOptions(mockOptions);
            }).not.toThrow();
        });
        it("should throw error if vid is missing", () => {
            expect(() => {
                service_1.default.validateOptions({ hashKey: 'test' });
            }).toThrow("iPay VID is required");
        });
        it("should throw error if hashKey is missing", () => {
            expect(() => {
                service_1.default.validateOptions({ vid: 'test' });
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
            service = new service_1.default(mockContainer, { ...mockOptions, live: true });
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
            const hash = service.generateHash(testData);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL3Byb3ZpZGVycy9pcGF5L19fdGVzdHNfXy9zZXJ2aWNlLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFFQSx5REFBNkM7QUFFN0Msc0JBQXNCO0FBQ3RCLE1BQU0sQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsRUFBRSxDQUFDO0FBRXpCLFFBQVEsQ0FBQyxxQkFBcUIsRUFBRSxHQUFHLEVBQUU7SUFDbkMsSUFBSSxPQUE0QixDQUFDO0lBQ2pDLElBQUksV0FBZ0IsQ0FBQztJQUNyQixJQUFJLGFBQThCLENBQUM7SUFFbkMsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNkLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztRQUVyQixXQUFXLEdBQUc7WUFDWixHQUFHLEVBQUUsVUFBVTtZQUNmLE9BQU8sRUFBRSxlQUFlO1lBQ3hCLElBQUksRUFBRSxLQUFLO1lBQ1gsZUFBZSxFQUFFO2dCQUNmLEtBQUssRUFBRSxJQUFJO2dCQUNYLE1BQU0sRUFBRSxJQUFJO2dCQUNaLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixRQUFRLEVBQUUsSUFBSTthQUNmO1NBQ0YsQ0FBQztRQUVGLGFBQWEsR0FBRyxFQUFxQixDQUFDO1FBRXRDLE9BQU8sR0FBRyxJQUFJLGlCQUFtQixDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUNoRSxDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7UUFDakMsRUFBRSxDQUFDLGdDQUFnQyxFQUFFLEdBQUcsRUFBRTtZQUN4QyxNQUFNLENBQUMsaUJBQW1CLENBQUMsVUFBVSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3RELENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsYUFBYSxFQUFF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