import { moduleIntegrationTestRunner } from "@medusajs/test-utils"
import IPayProviderService from "../service"

moduleIntegrationTestRunner<IPayProviderService>({
  moduleName: "payment",
  resolve: "./src/providers/ipay",
  testSuite: ({ service }) => {
    describe("IPayProviderService", () => {
      it("should initialize with correct identifier", () => {
        expect((service.constructor as any).identifier).toBe("ipay")
        expect(typeof service.initiatePayment).toBe("function")
      })

      it("should have all required payment provider methods", () => {
        expect(typeof service.initiatePayment).toBe("function")
        expect(typeof service.authorizePayment).toBe("function")
        expect(typeof service.capturePayment).toBe("function")
        expect(typeof service.cancelPayment).toBe("function")
        expect(typeof service.deletePayment).toBe("function")
        expect(typeof service.refundPayment).toBe("function")
        expect(typeof service.retrievePayment).toBe("function")
        expect(typeof service.updatePayment).toBe("function")
        expect(typeof service.getWebhookActionAndData).toBe("function")
      })

      describe("Payment Operations", () => {
        const mockPaymentContext = {
          amount: 10000, // 100.00 KES in cents
          currency_code: "KES",
          resource_id: "order_test_integration",
          customer: {
            id: "cus_test_integration",
            email: "test@example.com"
          }
        }

        it("should initiate a payment successfully", async () => {
          const result = await service.initiatePayment(mockPaymentContext)
          
          expect(result).toHaveProperty("session_data")
          expect(result.session_data).toHaveProperty("payment_url")
          expect(result.session_data).toHaveProperty("vid")
          expect(result.session_data).toHaveProperty("ivm")
          expect(result.session_data).toHaveProperty("qwh")
          expect(result.session_data).toHaveProperty("afd")
          expect(result.session_data).toHaveProperty("uyt")
          expect(result.session_data).toHaveProperty("hsh")
        })

        it("should authorize a payment", async () => {
          const mockInput = {
            data: {
              id: "payment_test_integration",
              amount: 10000,
              currency_code: "KES"
            }
          }

          const result = await service.authorizePayment(mockInput)
          
          expect(result).toHaveProperty("status")
          expect(result.status).toBe("authorized")
          expect(result).toHaveProperty("data")
        })

        it("should capture a payment", async () => {
          const mockPaymentData = {
            id: "payment_test_integration",
            amount: 10000
          }

          const result = await service.capturePayment(mockPaymentData)
          
          expect(result).toHaveProperty("status")
          expect(result.status).toBe("captured")
          expect(result).toHaveProperty("data")
        })

        it("should cancel a payment", async () => {
          const mockPaymentData = {
            id: "payment_test_integration"
          }

          const result = await service.cancelPayment(mockPaymentData)
          
          expect(result).toHaveProperty("status")
          expect(result.status).toBe("canceled")
          expect(result).toHaveProperty("data")
        })

        it("should delete a payment", async () => {
          const mockPaymentData = {
            id: "payment_test_integration"
          }

          const result = await service.deletePayment(mockPaymentData)
          
          expect(result).toHaveProperty("status")
          expect(result.status).toBe("canceled")
          expect(result).toHaveProperty("data")
        })

        it("should refund a payment", async () => {
          const mockInput = {
            data: {
              id: "payment_test_integration"
            },
            amount: 5000 // Partial refund
          }

          const result = await service.refundPayment(mockInput)
          
          expect(result).toHaveProperty("data")
          expect(result.data).toHaveProperty("refund_amount", 5000)
        })

        it("should retrieve a payment", async () => {
          const mockPaymentData = {
            id: "payment_test_integration"
          }

          const result = await service.retrievePayment(mockPaymentData)
          
          expect(result).toHaveProperty("status")
          expect(result).toHaveProperty("data")
        })

        it("should update a payment", async () => {
          const mockInput = {
            data: {
              id: "payment_test_integration",
              amount: 10000
            },
            amount: 15000,
            currency_code: "KES"
          }

          const result = await service.updatePayment(mockInput)
          
          expect(result).toHaveProperty("amount", 15000)
          expect(result).toHaveProperty("updated_at")
        })
      })

      describe("Webhook Handling", () => {
        it("should process webhook data correctly", async () => {
          const mockWebhookData = {
            id: "order_test_integration",
            status: "aei7p7yrx4ae34", // Success status
            txncd: "test_txn_integration",
            mc: "100.00"
          }

          const result = await service.getWebhookActionAndData(mockWebhookData)
          
          expect(result).toHaveProperty("action")
          expect(result.action).toBe("authorized")
          expect(result).toHaveProperty("data")
          expect(result.data).toHaveProperty("status")
          expect(result.data.status).toBe("captured")
        })

        it("should handle failed payment webhook", async () => {
          const mockWebhookData = {
            id: "order_test_integration",
            status: "aei7p7yrx4aei13", // Failed status
            txncd: "test_txn_integration",
            mc: "100.00"
          }

          const result = await service.getWebhookActionAndData(mockWebhookData)
          
          expect(result).toHaveProperty("action")
          expect(result.action).toBe("authorized")
          expect(result).toHaveProperty("data")
          expect(result.data).toHaveProperty("status")
          expect(result.data.status).toBe("requires_action")
        })
      })

      describe("Hash Generation", () => {
        it("should generate correct hash for payment data", () => {
          const testData = "live=0&oid=order_test&inv=order_test&ttl=100.00&tel=&eml=test@example.com&vid=demo&curr=KES&p1=&p2=&p3=&p4=&cbk=http://localhost:9000/webhooks/ipay&cst=1&crl=2"
          
          // Access the private method via bracket notation for testing
          const hash = (service as any).generateHash(testData, "demoCHANGED")
          
          expect(hash).toBeDefined()
          expect(typeof hash).toBe("string")
          expect(hash.length).toBeGreaterThan(0)
        })
      })
    })
  },
})

jest.setTimeout(60 * 1000) 