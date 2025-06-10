const { defineConfig } = require("@medusajs/framework/utils");

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL || "postgres://localhost/medusa_test",
    databaseDriverOptions: process.env.NODE_ENV === "test" ? {
      pool: {
        min: 0,
        max: 1,
        idleTimeoutMillis: 30000,
        acquireTimeoutMillis: 30000,
      },
    } : {},
    http: {
      port: process.env.PORT || 9000,
      adminPort: process.env.ADMIN_PORT || 9001,
      authPort: process.env.AUTH_PORT || 9002,
    },
  },
  modules: [
    {
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/providers/ipay",
            id: "ipay",
            options: {
              vid: process.env.IPAY_VID || "demo",
              hashKey: process.env.IPAY_HASH_KEY || "demoCHANGED",
              live: process.env.IPAY_LIVE === "true" || false,
              callback_url: process.env.IPAY_CALLBACK_URL || "http://localhost:9000/webhooks/ipay",
              channels: {
                mpesa: true,
                airtel: true,
                card: true,
                pesalink: true,
              },
            },
          },
        ],
      },
    },
  ],
}); 