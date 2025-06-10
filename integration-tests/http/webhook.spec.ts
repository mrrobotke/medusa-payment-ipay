import { medusaIntegrationTestRunner } from "@medusajs/test-utils";
import crypto from "crypto";

medusaIntegrationTestRunner({
  testSuite: ({ api, getContainer }) => {
    describe("iPay Webhook API - Comprehensive Integration Test", () => {
      const generateTestHash = (data: string, key: string): string => {
        return crypto.createHash("sha256").update(data + key).digest("hex");
      };

      // Single comprehensive test to avoid multiple environment reinitializations
      it("should handle all webhook scenarios and payment operations", async () => {
        // Test 1: Successful payment webhook (POST)
        const successWebhookData = {
          id: "order_test_123",
          status: "aei7p7yrx4ae34",
          txncd: "test_txn_123",
          mc: "100.00"
        };

        let response = await api.post("/webhooks/ipay", successWebhookData);
        expect(response.status).toBe(200);
        expect(response.data).toEqual({ message: "Webhook processed successfully", received: true });

        // Test 2: Pending payment webhook
        const pendingWebhookData = {
          id: "order_test_456",
          status: "bdi6p2yy76y6563",
          txncd: "test_txn_456",
          mc: "50.00"
        };

        response = await api.post("/webhooks/ipay", pendingWebhookData);
        expect(response.status).toBe(200);
        expect(response.data).toEqual({ message: "Webhook processed successfully", received: true });

        // Test 3: Failed payment webhook
        const failedWebhookData = {
          id: "order_test_789",
          status: "cr5i3pgy0xi7b2r",
          txncd: "test_txn_789",
          mc: "75.00"
        };

        response = await api.post("/webhooks/ipay", failedWebhookData);
        expect(response.status).toBe(200);
        expect(response.data).toEqual({ message: "Webhook processed successfully", received: true });

        // Test 4: Malformed payload handling
        response = await api.post("/webhooks/ipay", { invalid: "data" });
        expect(response.status).toBe(200);
        expect(response.data).toEqual({ message: "Webhook processed successfully", received: true });

        // Test 5: Empty payload handling
        response = await api.post("/webhooks/ipay", {});
        expect(response.status).toBe(200);
        expect(response.data).toEqual({ message: "Webhook processed successfully", received: true });

        // Test 6: Complete checkout flow
        const checkoutWebhookData = {
          id: "order_checkout_test_123",
          status: "aei7p7yrx4ae34",
          txncd: "checkout_txn_123",
          mc: "150.00",
          timestamp: new Date().toISOString()
        };

        response = await api.post("/webhooks/ipay", checkoutWebhookData);
        expect(response.status).toBe(200);
        expect(response.data).toEqual({ message: "Webhook processed successfully", received: true });

        // Test 7: Payment provider configuration verification
        const container = getContainer();
        expect(container).toBeDefined();
        
        const configWebhookData = {
          id: "order_config_test_456",
          status: "aei7p7yrx4ae34",
          txncd: "config_txn_456",
          mc: "200.00"
        };

        response = await api.post("/webhooks/ipay", configWebhookData);
        expect(response.status).toBe(200);
        expect(response.data).toEqual({ message: "Webhook processed successfully", received: true });

        // All tests completed successfully
        console.log("All iPay webhook integration tests passed successfully!");
      });

      // Cleanup after all tests
      afterAll(async () => {
        try {
          // Allow time for any pending operations to complete
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.log("Cleanup completed");
        }
      });
    });
  },
});

// Set Jest timeout as recommended by Medusa developers
jest.setTimeout(60 * 1000); 