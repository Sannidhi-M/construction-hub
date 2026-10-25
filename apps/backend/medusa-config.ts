import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    }
  },
  modules: [
    {
      resolve: './src/modules/delivery-area',
    },
    {
      resolve: './src/modules/labour-booking',
    },
    {
      resolve: './src/modules/quote-request',
    },
    {
      resolve: './src/modules/contact-message',
    },
    // Declaring the Auth/Notification modules ourselves REPLACES (not
    // merges with) Medusa's own default `providers` array for that module
    // (see apps/backend/node_modules/@medusajs/utils's defineConfig source)
    // — so each provider list below explicitly re-includes the built-in
    // provider the framework would otherwise have registered by default
    // (auth-emailpass, notification-local), alongside the new one.
    {
      resolve: '@medusajs/medusa/auth',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/auth-emailpass',
            id: 'emailpass',
          },
          {
            resolve: './src/modules/phone-otp-auth',
            id: 'phone-auth',
            options: {
              jwtSecret: process.env.JWT_SECRET,
            },
          },
        ],
      },
    },
    {
      resolve: '@medusajs/medusa/notification',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/notification-local',
            id: 'local',
            options: {
              name: 'Local Notification Provider',
              channels: ['feed'],
            },
          },
          {
            resolve: './src/modules/msg91-notification',
            id: 'msg91',
            options: {
              channels: ['sms'],
              authKey: process.env.MSG91_AUTH_KEY,
              flowId: process.env.MSG91_FLOW_ID,
              senderId: process.env.MSG91_SENDER_ID,
            },
          },
        ],
      },
    },
  ],
})
