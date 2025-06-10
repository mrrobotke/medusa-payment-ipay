# Medusa Payment iPay

A Medusa v2 payment provider plugin for iPay Africa, supporting multiple payment channels including M-Pesa, Airtel Money, Credit/Debit Cards, and PesaLink.

## Features

- 🚀 **Complete iPay Africa Integration** - Full support for iPay's payment gateway
- 💳 **Multiple Payment Channels**:
  - M-Pesa (Safaricom Mobile Money)
  - Airtel Money
  - Credit/Debit Cards (Visa, Mastercard)
  - PesaLink (Bank transfers)
- 🔒 **Secure Transactions** - HMAC SHA1 signature verification
- 🎛️ **Admin Configuration** - Easy setup through Medusa Admin dashboard
- 🔄 **Webhook Support** - Real-time payment status updates
- 🧪 **Test Mode** - Sandbox environment for development
- 📱 **Responsive Design** - Works on desktop and mobile

## Installation

```bash
npm install medusa-payment-ipay
# or
yarn add medusa-payment-ipay
```

## Configuration

### 1. Add to medusa-config.ts

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
            resolve: "medusa-payment-ipay/providers/ipay",
            id: "ipay",
            options: {
              vid: process.env.IPAY_VID, // Your iPay Vendor ID
              hashKey: process.env.IPAY_HASH_KEY, // Your iPay Hash Key
              live: process.env.IPAY_LIVE === "true", // true for production, false for testing
              enabledChannels: {
                mpesa: true,
                airtel: true,
                creditcard: false, // Enable for card payments (requires PCI compliance)
                pesalink: false // Enable for bank transfers
              }
            }
          }
        ]
      }
    }
  ]
})
```

### 2. Environment Variables

Add these to your `.env` file:

```bash
# iPay Configuration
IPAY_VID=your_vendor_id
IPAY_HASH_KEY=your_hash_key
IPAY_LIVE=false  # Set to true for production

# For testing, use these values:
# IPAY_VID=demo
# IPAY_HASH_KEY=demoCHANGED
```

### 3. Admin Configuration

1. Navigate to your Medusa Admin dashboard
2. Go to Settings → Payment Providers
3. Enable the iPay provider for your sales regions
4. Configure your iPay credentials through the admin widget

## Usage

### Test Credentials

For development and testing:
- **Vendor ID**: `demo`
- **Hash Key**: `demoCHANGED`
- **Live Mode**: `false`

### Test Card Numbers

When testing credit card payments:
- **Success**: `4444444444444444`
- **Failure**: `3333333333333333`

### Payment Flow

1. Customer selects iPay as payment method during checkout
2. Customer is redirected to iPay's secure payment gateway
3. Customer chooses payment channel (M-Pesa, Airtel, Card, etc.)
4. Customer completes payment following iPay's interface
5. Customer is redirected back to your store
6. Webhook confirms payment status

## API Reference

### Payment Provider Options

```typescript
interface IPayOptions {
  vid: string                    // iPay Vendor ID
  hashKey: string               // iPay Hash Key
  live: boolean                 // Production mode
  enabledChannels?: {
    mpesa?: boolean            // Enable M-Pesa
    airtel?: boolean           // Enable Airtel Money
    creditcard?: boolean       // Enable Credit/Debit Cards
    pesalink?: boolean         // Enable PesaLink
  }
}
```

### Webhook Endpoint

The plugin automatically creates a webhook endpoint at:
```
POST /webhooks/ipay/{resource_id}
GET /webhooks/ipay/{resource_id}
```

iPay will send payment status updates to this endpoint.

## Payment Status Mapping

| iPay Status | Description | Medusa Status |
|-------------|-------------|---------------|
| `aei7p7yrx4ae34` | Success | AUTHORIZED |
| `bdi6p2yy76etrs` | Pending | PENDING |
| `fe2707etr5s4wq` | Failed | ERROR |
| `dtfi4p7yty45wq` | Less amount | ERROR |
| `cr5i3pgy9867e1` | Used code | ERROR |

## Development

### Prerequisites

- Node.js 20+
- Medusa v2.4.0+

### Setup

1. Clone the repository
```bash
git clone https://github.com/your-org/medusa-payment-ipay.git
cd medusa-payment-ipay
```

2. Install dependencies
```bash
yarn install
```

3. Build the plugin
```bash
yarn build
```

4. Run in development mode
```bash
yarn dev
```

### Testing

```bash
# Run tests
yarn test

# Run with coverage
yarn test:coverage
```

## Production Deployment

1. **Get Production Credentials**:
   - Register with iPay Africa
   - Obtain your production Vendor ID and Hash Key
   - Complete any required verification processes

2. **Update Configuration**:
   ```bash
   IPAY_VID=your_production_vid
   IPAY_HASH_KEY=your_production_hash_key
   IPAY_LIVE=true
   ```

3. **Enable Payment Channels**:
   - Configure which payment methods to accept
   - For credit cards, ensure PCI compliance
   - Test all payment flows

4. **Webhook Configuration**:
   - Ensure your webhook endpoint is accessible
   - Configure proper SSL certificates
   - Test webhook delivery

## Troubleshooting

### Common Issues

1. **Payment fails with "hash mismatch"**
   - Verify your hash key is correct
   - Ensure no extra spaces in environment variables
   - Check that all required parameters are included

2. **Webhook not receiving callbacks**
   - Verify webhook URL is publicly accessible
   - Check firewall settings
   - Ensure proper HTTPS configuration

3. **Payment gateway not loading**
   - Check if you're using correct iPay gateway URL
   - Verify VID and hash key are valid
   - Ensure live mode setting matches your credentials

### Debug Mode

Enable debug logging:
```typescript
// In your medusa-config.ts
export default defineConfig({
  projectConfig: {
    worker_mode: "server",
    // ... other config
  },
  // Add debug logging
  logger: {
    level: "debug"
  }
})
```

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `yarn test`
6. Commit your changes: `git commit -m 'Add amazing feature'`
7. Push to the branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## Support

- 📧 **Email**: support@yourdomain.com
- 💬 **Discord**: [Join our community](https://discord.gg/medusajs)
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-org/medusa-payment-ipay/issues)
- 📖 **Documentation**: [Full documentation](https://docs.yourdomain.com)

## Related Links

- [iPay Africa Documentation](https://dev.ipayafrica.com/)
- [Medusa Documentation](https://docs.medusajs.com/)
- [Medusa Payment Provider Guide](https://docs.medusajs.com/resources/references/payment/provider)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- iPay Africa for their payment gateway services
- Medusa team for the excellent e-commerce framework
- Contributors who help improve this plugin

---

**⚠️ Important Notes:**
- Always test in sandbox mode before going live
- Ensure PCI compliance when accepting credit card payments
- Keep your hash key secure and never commit it to version control
- Regularly update the plugin to get security fixes and new features
