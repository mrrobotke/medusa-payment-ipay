import {
  AbstractPaymentProvider,
} from "@medusajs/framework/utils"
import { 
  MedusaContainer
} from "@medusajs/framework/types"
import crypto from "crypto"

type IPayOptions = {
  vid: string
  hashKey: string
  live: boolean
  enabledChannels?: {
    mpesa?: boolean
    airtel?: boolean
    creditcard?: boolean
    pesalink?: boolean
  }
}

class IPayProviderService extends AbstractPaymentProvider<IPayOptions> {
  static identifier = "ipay"

  protected readonly options_: IPayOptions

  constructor(
    container: MedusaContainer,
    options: IPayOptions
  ) {
    super(container, options)
    
    this.options_ = options
  }

  static validateOptions(options: Record<string, any>): void {
    if (!options.vid) {
      throw new Error("iPay VID is required")
    }
    if (!options.hashKey) {
      throw new Error("iPay hash key is required")
    }
  }

  async initiatePayment(input: any): Promise<any> {
    const { amount, currency_code, context } = input
    
    // Generate unique order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
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
    }

    // Generate hash
    paymentData.hsh = this.generateHash(paymentData)

    // iPay gateway URL
    const gatewayUrl = this.options_.live 
      ? "https://www.ipayafrica.com/ipn/"
      : "https://www.ipayafrica.com/ipn/"

    return {
      data: {
        id: orderId,
        paymentData,
        gatewayUrl,
        status: "pending",
        amount,
        currency_code
      }
    }
  }

  async authorizePayment(input: any): Promise<any> {
    const { data } = input

    return {
      status: "authorized",
      data: {
        ...data,
        status: "authorized",
        authorized_at: new Date().toISOString()
      }
    }
  }

  async capturePayment(input: any): Promise<any> {
    const { data } = input

    return {
      data: {
        ...data,
        status: "captured",
        captured_at: new Date().toISOString()
      }
    }
  }

  async cancelPayment(input: any): Promise<any> {
    const { data } = input

    return {
      data: {
        ...data,
        status: "cancelled",
        cancelled_at: new Date().toISOString()
      }
    }
  }

  async deletePayment(input: any): Promise<any> {
    return {
      data: input.data
    }
  }

  async getPaymentStatus(input: any): Promise<any> {
    const { data } = input
    const status = data?.status || "pending"
    
    return {
      status: status
    }
  }

  async refundPayment(input: any): Promise<any> {
    const { data, amount } = input

    console.log(`Refund requested for payment ${data?.id}: ${amount}`)

    return {
      data: {
        ...data,
        refund_requested: true,
        refund_amount: amount,
        refund_requested_at: new Date().toISOString()
      }
    }
  }

  async retrievePayment(input: any): Promise<any> {
    return input.data || {}
  }

  async updatePayment(input: any): Promise<any> {
    const { amount, currency_code, data } = input

    const updatedData = {
      ...data,
      amount,
      currency_code,
      updated_at: new Date().toISOString()
    }

    if (data?.amount && Math.abs(data.amount - amount) > 0) {
      console.log(`Payment amount updated from ${data.amount} to ${amount}`)
    }

    return updatedData
  }

  async getWebhookActionAndData(payload: any): Promise<any> {
    try {
      const { data } = payload
      const webhookData = data as any
      const status = webhookData.status
      const sessionId = webhookData.p1 || webhookData.oid

      switch (status) {
        case "aei7p7yrx4ae34": // Success
          return {
            action: "authorized",
            data: {
              session_id: sessionId,
              amount: parseFloat(webhookData.mc || webhookData.ttl || "0") * 100
            }
          }
        case "bdi6p2yy76etrs": // Pending
          return {
            action: "not_supported",
            data: {
              session_id: sessionId,
              amount: parseFloat(webhookData.mc || webhookData.ttl || "0") * 100
            }
          }
        case "fe2707etr5s4wq": // Failed
        case "dtfi4p7yty45wq": // Less amount
        case "cr5i3pgy9867e1": // Used code
          return {
            action: "failed",
            data: {
              session_id: sessionId,
              amount: parseFloat(webhookData.mc || webhookData.ttl || "0") * 100
            }
          }
        default:
          return {
            action: "not_supported",
            data: {
              session_id: sessionId,
              amount: 0
            }
          }
      }
    } catch (error) {
      console.error("Error processing iPay webhook:", error)
      return {
        action: "failed",
        data: {
          session_id: "",
          amount: 0
        }
      }
    }
  }

  private generateHash(data: any): string {
    const hashString = `${data.live}${data.oid}${data.inv}${data.ttl}${data.tel}${data.eml}${data.vid}${data.curr}${data.p1}${data.p2}${data.p3}${data.p4}${data.cbk}${data.cst}${data.crl}${this.options_.hashKey}`
    
    return crypto
      .createHash('sha1')
      .update(hashString)
      .digest('hex')
  }
}

export default IPayProviderService 