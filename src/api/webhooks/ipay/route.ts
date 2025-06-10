import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

interface IPayWebhookBody {
  id: string
  status: string
  txncd?: string
  mc?: string
  ivm: string
  qwh: string
  afd: string
  poi: string
  uyt: string
  ifd: string
  agt: string
  p1?: string
  p2?: string
  p3?: string
  p4?: string
  msisdn_id?: string
  msisdn_idnum?: string
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    const webhookData = req.body as IPayWebhookBody
    const { 
      id, 
      status, 
      txncd, 
      mc, 
      ivm, 
      qwh, 
      afd, 
      poi, 
      uyt, 
      ifd, 
      agt,
      p1,
      p2, 
      p3,
      p4,
      msisdn_id,
      msisdn_idnum 
    } = webhookData

    console.log("iPay webhook received:", {
      id,
      status,
      txncd,
      mc,
      timestamp: new Date().toISOString()
    })

    // Update payment session based on the callback
    // This is where you would typically update the payment status in your database
    
    // Process the payment status
    switch (status) {
      case "aei7p7yrx4ae34": // Success
        console.log(`Payment ${id} completed successfully`)
        // Update payment to authorized/captured
        break
      case "bdi6p2yy76etrs": // Pending
        console.log(`Payment ${id} is pending`)
        // Keep payment in pending state
        break
      case "fe2707etr5s4wq": // Failed
      case "dtfi4p7yty45wq": // Less amount
      case "cr5i3pgy9867e1": // Used code
        console.log(`Payment ${id} failed with status: ${status}`)
        // Mark payment as failed
        break
      default:
        console.log(`Unknown payment status: ${status}`)
    }

    res.status(200).json({ 
      message: "Webhook processed successfully",
      received: true 
    })
    
  } catch (error) {
    console.error("Error processing iPay webhook:", error)
    res.status(500).json({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    })
  }
}

export async function GET(
  req: MedusaRequest,
  res: MedusaResponse
): Promise<void> {
  try {
    // Handle GET callback (when crl=0)
    const queryData = req.query as Record<string, string>
    const { 
      id, 
      status, 
      txncd, 
      mc, 
      ivm, 
      qwh, 
      afd, 
      poi, 
      uyt, 
      ifd, 
      agt,
      p1,
      p2, 
      p3,
      p4,
      msisdn_id,
      msisdn_idnum 
    } = queryData

    console.log("iPay GET callback received:", {
      id,
      status,
      txncd,
      mc,
      timestamp: new Date().toISOString()
    })

    // Process similar to POST
    switch (status) {
      case "aei7p7yrx4ae34": // Success
        console.log(`Payment ${id} completed successfully`)
        break
      case "bdi6p2yy76etrs": // Pending
        console.log(`Payment ${id} is pending`)
        break
      case "fe2707etr5s4wq": // Failed
      case "dtfi4p7yty45wq": // Less amount
      case "cr5i3pgy9867e1": // Used code
        console.log(`Payment ${id} failed with status: ${status}`)
        break
      default:
        console.log(`Unknown payment status: ${status}`)
    }

    // Redirect to success/failure page
    const redirectUrl = status === "aei7p7yrx4ae34" 
      ? "/payment/success" 
      : "/payment/failed"
    
    res.redirect(redirectUrl)
    
  } catch (error) {
    console.error("Error processing iPay GET callback:", error)
    res.status(500).json({ 
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Unknown error"
    })
  }
} 