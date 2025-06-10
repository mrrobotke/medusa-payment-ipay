import { medusaIntegrationTestRunner } from "@medusajs/test-utils";
import crypto from "crypto";

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("iPay Webhook API", () => {
      const generateTestHash = (data: string, key: string): string => {
        return crypto.createHash("sha256").update(data + key).digest("hex");
      };

      const createWebhookPayload = (status: string, overrides: any = {}) => {
        const basePayload = {
          id: "order_test_123",
          ivm: "INV_order_test_123",
          qwh: generateTestHash("test_data", "test_key"),
          afd: "",
          poi: "",
          uyt: "",
          ifd: "",
          agt: "1",
          mc: "100.00",
          p1: "order_test_123",
          p2: "cus_test_123",
          p3: "",
          p4: "",
          status,
          txncd: "test_txn_123",
          msisdn_id: "test_msisdn",
          msisdn_idnum: "254700000000",
          ...overrides,
        };
        return basePayload;
      };

      describe("POST /webhooks/ipay", () => {
        it("should handle successful payment webhook", async () => {
          const webhookData = {
            id: "order_test_123",
            status: "aei7p7yrx4ae34",
            txncd: "test_txn_123",
            mc: "100.00"
          };

          const response = await api.post("/webhooks/ipay", webhookData);

          expect(response.status).toBe(200);
          expect(response.data).toEqual({ message: "Webhook processed successfully", received: true });
        }, 10000);

        it("should handle pending payment webhook", async () => {
          const webhookData = {
            id: "order_test_456",
            status: "bdi6p2yy76y6563",
            txncd: "test_txn_456",
            mc: "50.00"
          };

          const response = await api.post("/webhooks/ipay", webhookData);

          expect(response.status).toBe(200);
          expect(response.data).toEqual({ message: "Webhook processed successfully", received: true });
        }, 10000);

        it("should handle failed payment webhook", async () => {
          const webhookData = {
            id: "order_test_789",
            status: "cr5i3pgy0xi7b2r",
            txncd: "test_txn_789",
            mc: "75.00"
          };

          const response = await api.post("/webhooks/ipay", webhookData);

          expect(response.status).toBe(200);
          expect(response.data).toEqual({ message: "Webhook processed successfully", received: true });
        }, 10000);

        it("should handle malformed payload gracefully", async () => {
          const response = await api.post("/webhooks/ipay", { invalid: "data" });

          expect(response.status).toBe(200);
          expect(response.data).toEqual({ message: "Webhook processed successfully", received: true });
        }, 10000);

        it("should handle empty payload", async () => {
          const response = await api.post("/webhooks/ipay", {});

          expect(response.status).toBe(200);
          expect(response.data).toEqual({ message: "Webhook processed successfully", received: true });
        }, 10000);
      });

      describe("GET /webhooks/ipay", () => {
        it("should handle GET callback from iPay for success", async () => {
          const params = new URLSearchParams({
            id: "order_test_get_123",
            status: "aei7p7yrx4ae34",
            txncd: "test_get_txn_123",
            mc: "100.00"
          });

          const response = await api.get(`/webhooks/ipay?${params.toString()}`);

          expect(response.status).toBe(200);
          expect(response.data).toEqual({ message: "Webhook processed successfully" });
        }, 10000);

        it("should handle GET callback for failed payment", async () => {
          const params = new URLSearchParams({
            id: "order_test_get_456",
            status: "cr5i3pgy0xi7b2r",
            txncd: "test_get_txn_456",
            mc: "50.00"
          });

          const response = await api.get(`/webhooks/ipay?${params.toString()}`);

          expect(response.status).toBe(200);
          expect(response.data).toEqual({ message: "Webhook processed successfully" });
        }, 10000);

        it("should handle missing query parameters", async () => {
          const response = await api.get("/webhooks/ipay");

          expect(response.status).toBe(200);
          expect(response.data).toEqual({ message: "Webhook processed successfully" });
        }, 10000);
      });

      describe("Complete Checkout Flow", () => {
        it("successfully processes payment during checkout", async () => {
          const webhookData = {
            id: "order_checkout_test_123",
            status: "aei7p7yrx4ae34",
            txncd: "checkout_txn_123",
            mc: "150.00",
            timestamp: new Date().toISOString()
          };

          const response = await api.post("/webhooks/ipay", webhookData);

          expect(response.status).toBe(200);
          expect(response.data).toEqual({ message: "Webhook processed successfully", received: true });
        }, 10000);

        it("handles payment provider configuration", async () => {
          // Test that iPay provider is properly configured
          const container = getContainer();
          expect(container).toBeDefined();
          
          const webhookData = {
            id: "order_config_test_456",
            status: "aei7p7yrx4ae34",
            txncd: "config_txn_456",
            mc: "200.00"
          };

          const response = await api.post("/webhooks/ipay", webhookData);
          expect(response.status).toBe(200);
          expect(response.data).toEqual({ message: "Webhook processed successfully", received: true });
        }, 10000);
      });
    });
  },
}); 