# iPay Payment Plugin Integration Guide

## Quick Start

### 1. Install the Plugin

```bash
cd path/to/your/medusa/project
yarn add ./path/to/medusa-payment-ipay
```

### 2. Configure Environment Variables

Add to your `.env` file:

```bash
# iPay Configuration
IPAY_VID=demo                    # Replace with your iPay VID
IPAY_HASH_KEY=demoCHANGED       # Replace with your iPay hash key
IPAY_LIVE=false                 # Set to true for production
BACKEND_URL=http://localhost:9000  # Your backend URL for webhooks
```

### 3. Update medusa-config.ts

```typescript
import { defineConfig } from "@medusajs/medusa"

export default defineConfig({
  // ... other config
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./medusa-payment-ipay/providers/ipay",
            id: "ipay",
            options: {
              vid: process.env.IPAY_VID,
              hashKey: process.env.IPAY_HASH_KEY,
              live: process.env.IPAY_LIVE === "true",
              enabledChannels: {
                mpesa: true,      // Enable M-Pesa
                airtel: true,     // Enable Airtel Money
                creditcard: false, // Enable credit cards (requires PCI compliance)
                pesalink: false   // Enable PesaLink bank transfers
              }
            }
          }
        ]
      }
    }
  ]
})
```

### 4. Enable in Admin

1. Start your Medusa backend: `yarn dev`
2. Go to Medusa Admin → Settings → Regions
3. Select your region (e.g., Kenya)
4. Add "iPay" as a payment provider
5. Save changes

### 5. Test Integration

Use the test credentials:
- **VID**: `demo`
- **Hash Key**: `demoCHANGED`
- **Live Mode**: `false`

## Payment Flow

1. **Customer Checkout**: Customer selects iPay as payment method
2. **Payment Initiation**: Plugin generates payment form data
3. **Redirect to iPay**: Customer is redirected to iPay gateway
4. **Payment Processing**: Customer completes payment (M-Pesa, Airtel, etc.)
5. **Webhook Callback**: iPay sends payment status to your webhook
6. **Order Completion**: Based on status, order is completed or failed

## Webhook Configuration

The plugin automatically creates a webhook endpoint at:
```
POST /webhooks/ipay
```

iPay will send payment notifications to this endpoint.

## Payment Status Codes

| iPay Status | Description | Action |
|-------------|-------------|---------|
| `aei7p7yrx4ae34` | Payment successful | Order completed |
| `bdi6p2yy76etrs` | Payment pending | Keep order pending |
| `fe2707etr5s4wq` | Payment failed | Mark order as failed |
| `dtfi4p7yty45wq` | Insufficient amount | Mark order as failed |
| `cr5i3pgy9867e1` | Used transaction code | Mark order as failed |

## Storefront Integration

### Basic Setup

```javascript
// In your storefront checkout component
const completeOrder = async () => {
  try {
    // Set payment provider
    await medusaClient.carts.setPaymentSession(cartId, {
      provider_id: "ipay"
    })

    // Complete cart (this will redirect to iPay)
    const response = await medusaClient.carts.complete(cartId)
    
    if (response.type === "cart") {
      // Get payment data
      const paymentData = response.cart.payment_session.data
      
      // Redirect to iPay gateway
      redirectToIPay(paymentData.paymentData, paymentData.gatewayUrl)
    }
  } catch (error) {
    console.error("Payment initiation failed:", error)
  }
}

const redirectToIPay = (paymentData, gatewayUrl) => {
  // Create a form and submit to iPay
  const form = document.createElement('form')
  form.method = 'POST'
  form.action = gatewayUrl
  
  // Add payment fields
  Object.keys(paymentData).forEach(key => {
    const input = document.createElement('input')
    input.type = 'hidden'
    input.name = key
    input.value = paymentData[key]
    form.appendChild(input)
  })
  
  document.body.appendChild(form)
  form.submit()
}
```

### React/Next.js Example

```jsx
import { useState } from 'react'
import { useMedusaClient } from 'medusa-react'

const CheckoutPayment = ({ cart }) => {
  const [loading, setLoading] = useState(false)
  const client = useMedusaClient()

  const handleIPay = async () => {
    setLoading(true)
    
    try {
      await client.carts.setPaymentSession(cart.id, {
        provider_id: "ipay"
      })

      const response = await client.carts.complete(cart.id)
      
      if (response.type === "cart") {
        const { paymentData, gatewayUrl } = response.cart.payment_session.data
        
        // Create form and submit
        const form = document.createElement('form')
        form.method = 'POST'
        form.action = gatewayUrl
        form.target = '_self'
        
        Object.entries(paymentData).forEach(([key, value]) => {
          const input = document.createElement('input')
          input.type = 'hidden'
          input.name = key
          input.value = value
          form.appendChild(input)
        })
        
        document.body.appendChild(form)
        form.submit()
      }
    } catch (error) {
      console.error('Payment failed:', error)
      alert('Payment initiation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button 
      onClick={handleIPay} 
      disabled={loading}
      className="bg-green-600 text-white px-6 py-3 rounded-lg"
    >
      {loading ? 'Initializing...' : 'Pay with M-Pesa/Airtel'}
    </button>
  )
}
```

## Production Setup

### 1. Get Production Credentials

1. Register with iPay Africa: https://ipayafrica.com
2. Complete verification process
3. Obtain production VID and hash key

### 2. Update Environment

```bash
IPAY_VID=your_production_vid
IPAY_HASH_KEY=your_production_hash_key
IPAY_LIVE=true
BACKEND_URL=https://your-domain.com
```

### 3. SSL Configuration

Ensure your webhook endpoint uses HTTPS:
- Configure SSL certificate
- Test webhook delivery
- Monitor webhook logs

### 4. Security Considerations

- Never expose hash key in frontend code
- Validate all webhook requests
- Log all payment transactions
- Implement proper error handling

## Troubleshooting

### Common Issues

1. **Hash mismatch error**
   - Verify VID and hash key
   - Check parameter order in hash generation
   - Ensure no extra spaces in environment variables

2. **Webhook not received**
   - Check if webhook URL is publicly accessible
   - Verify SSL certificate
   - Check firewall settings

3. **Payment not completing**
   - Check iPay dashboard for transaction status
   - Verify webhook endpoint implementation
   - Check backend logs for errors

### Debug Mode

Enable debug logging in your medusa-config.ts:

```typescript
export default defineConfig({
  // ... other config
  logger: {
    level: "debug"
  }
})
```

### Testing

Test with different scenarios:
- Successful payment
- Failed payment  
- Cancelled payment
- Network timeouts

## Support

- **iPay Documentation**: https://dev.ipayafrica.com/
- **Medusa Documentation**: https://docs.medusajs.com/
- **Plugin Issues**: Create an issue in the plugin repository

## License

MIT License - see LICENSE file for details. 