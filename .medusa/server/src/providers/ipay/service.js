"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("@medusajs/framework/utils");
const crypto_1 = __importDefault(require("crypto"));
class IPayProviderService extends utils_1.AbstractPaymentProvider {
    constructor(container, options) {
        super(container, options);
        this.options_ = options;
    }
    static validateOptions(options) {
        if (!options.vid) {
            throw new Error("iPay VID is required");
        }
        if (!options.hashKey) {
            throw new Error("iPay hash key is required");
        }
    }
    async initiatePayment(input) {
        const { amount, currency_code, context } = input;
        // Generate unique order ID
        const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // Prepare payment form data
        const paymentData = {
            oid: orderId,
            inv: `INV_${orderId}`,
            ttl: (amount / 100).toString(),
            tel: context?.customer?.phone || "",
            eml: context?.customer?.email || "",
            vid: this.options_.vid,
            curr: currency_code.toUpperCase(),
            p1: context?.order?.id || "",
            p2: context?.customer?.id || "",
            p3: "",
            p4: "",
            cbk: `${process.env.BACKEND_URL || "http://localhost:9000"}/webhooks/ipay`,
            cst: this.options_.live ? "1" : "0",
            crl: "1",
            live: this.options_.live ? "1" : "0",
            hsh: ""
        };
        // Generate hash
        paymentData.hsh = this.generateHash(paymentData);
        // iPay gateway URL
        const gatewayUrl = this.options_.live
            ? "https://www.ipayafrica.com/ipn/"
            : "https://www.ipayafrica.com/ipn/";
        return {
            data: {
                id: orderId,
                paymentData,
                gatewayUrl,
                status: "pending",
                amount,
                currency_code
            }
        };
    }
    async authorizePayment(input) {
        const { data } = input;
        return {
            status: "authorized",
            data: {
                ...data,
                status: "authorized",
                authorized_at: new Date().toISOString()
            }
        };
    }
    async capturePayment(input) {
        const { data } = input;
        return {
            data: {
                ...data,
                status: "captured",
                captured_at: new Date().toISOString()
            }
        };
    }
    async cancelPayment(input) {
        const { data } = input;
        return {
            data: {
                ...data,
                status: "cancelled",
                cancelled_at: new Date().toISOString()
            }
        };
    }
    async deletePayment(input) {
        return {
            data: input.data
        };
    }
    async getPaymentStatus(input) {
        const { data } = input;
        const status = data?.status || "pending";
        return {
            status: status
        };
    }
    async refundPayment(input) {
        const { data, amount } = input;
        console.log(`Refund requested for payment ${data?.id}: ${amount}`);
        return {
            data: {
                ...data,
                refund_requested: true,
                refund_amount: amount,
                refund_requested_at: new Date().toISOString()
            }
        };
    }
    async retrievePayment(input) {
        return input.data || {};
    }
    async updatePayment(input) {
        const { amount, currency_code, data } = input;
        const updatedData = {
            ...data,
            amount,
            currency_code,
            updated_at: new Date().toISOString()
        };
        if (data?.amount && Math.abs(data.amount - amount) > 0) {
            console.log(`Payment amount updated from ${data.amount} to ${amount}`);
        }
        return updatedData;
    }
    async getWebhookActionAndData(payload) {
        try {
            const { data } = payload;
            const webhookData = data;
            const status = webhookData.status;
            const sessionId = webhookData.p1 || webhookData.oid;
            switch (status) {
                case "aei7p7yrx4ae34": // Success
                    return {
                        action: "authorized",
                        data: {
                            session_id: sessionId,
                            amount: parseFloat(webhookData.mc || webhookData.ttl || "0") * 100
                        }
                    };
                case "bdi6p2yy76etrs": // Pending
                    return {
                        action: "not_supported",
                        data: {
                            session_id: sessionId,
                            amount: parseFloat(webhookData.mc || webhookData.ttl || "0") * 100
                        }
                    };
                case "fe2707etr5s4wq": // Failed
                case "dtfi4p7yty45wq": // Less amount
                case "cr5i3pgy9867e1": // Used code
                    return {
                        action: "failed",
                        data: {
                            session_id: sessionId,
                            amount: parseFloat(webhookData.mc || webhookData.ttl || "0") * 100
                        }
                    };
                default:
                    return {
                        action: "not_supported",
                        data: {
                            session_id: sessionId,
                            amount: 0
                        }
                    };
            }
        }
        catch (error) {
            console.error("Error processing iPay webhook:", error);
            return {
                action: "failed",
                data: {
                    session_id: "",
                    amount: 0
                }
            };
        }
    }
    generateHash(data) {
        const hashString = `${data.live}${data.oid}${data.inv}${data.ttl}${data.tel}${data.eml}${data.vid}${data.curr}${data.p1}${data.p2}${data.p3}${data.p4}${data.cbk}${data.cst}${data.crl}${this.options_.hashKey}`;
        return crypto_1.default
            .createHash('sha1')
            .update(hashString)
            .digest('hex');
    }
}
IPayProviderService.identifier = "ipay";
exports.default = IPayProviderService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy9wcm92aWRlcnMvaXBheS9zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEscURBRWtDO0FBSWxDLG9EQUEyQjtBQWMzQixNQUFNLG1CQUFvQixTQUFRLCtCQUFvQztJQUtwRSxZQUNFLFNBQTBCLEVBQzFCLE9BQW9CO1FBRXBCLEtBQUssQ0FBQyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUE7UUFFekIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUE7SUFDekIsQ0FBQztJQUVELE1BQU0sQ0FBQyxlQUFlLENBQUMsT0FBNEI7UUFDakQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNqQixNQUFNLElBQUksS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUE7UUFDekMsQ0FBQztRQUNELElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDckIsTUFBTSxJQUFJLEtBQUssQ0FBQywyQkFBMkIsQ0FBQyxDQUFBO1FBQzlDLENBQUM7SUFDSCxDQUFDO0lBRUQsS0FBSyxDQUFDLGVBQWUsQ0FBQyxLQUFVO1FBQzlCLE1BQU0sRUFBRSxNQUFNLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRSxHQUFHLEtBQUssQ0FBQTtRQUVoRCwyQkFBMkI7UUFDM0IsTUFBTSxPQUFPLEdBQUcsU0FBUyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUE7UUFFaEYsNEJBQTRCO1FBQzVCLE1BQU0sV0FBVyxHQUFHO1lBQ2xCLEdBQUcsRUFBRSxPQUFPO1lBQ1osR0FBRyxFQUFFLE9BQU8sT0FBTyxFQUFFO1lBQ3JCLEdBQUcsRUFBRSxDQUFDLE1BQU0sR0FBRyxH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