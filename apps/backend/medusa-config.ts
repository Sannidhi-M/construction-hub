import path from 'path'
import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Production runs Redis (see docs/DEPLOYMENT-PLAN.md); local dev may not.
// REDIS_URL on its own only reaches this project's OTP / rate-limit client
// (src/lib/redis.ts) — Medusa's sessions, event bus, workflow engine and
// locking each have to be pointed at Redis explicitly, below. Unset, Medusa
// keeps its in-memory defaults, as local dev always has.
const REDIS_URL = process.env.REDIS_URL

const redisModules = REDIS_URL
  ? [
      {
        resolve: '@medusajs/medusa/event-bus-redis',
        options: { redisUrl: REDIS_URL },
      },
      {
        resolve: '@medusajs/medusa/workflow-engine-redis',
        options: { redis: { redisUrl: REDIS_URL } },
      },
      {
        resolve: '@medusajs/medusa/locking',
        options: {
          providers: [
            {
              resolve: '@medusajs/medusa/locking-redis',
              id: 'locking-redis',
              is_default: true,
              options: { redisUrl: REDIS_URL },
            },
          ],
        },
      },
    ]
  : []

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
    // Admin sessions in Redis survive a backend restart (in memory, every
    // restart signs the Admin out).
    redisUrl: REDIS_URL,
  },
  modules: [
    ...redisModules,
    // Uploaded files stay on this server's disk (docs/DEPLOYMENT-PLAN.md,
    // "Securing private files"). Public files (product/labour photos) live in
    // static/, which the backend serves at /static. Private files (Admin CSV
    // exports and imports) go to a separate folder OUTSIDE static/: the
    // provider's default puts them inside static/ under a guessable
    // "private-<timestamp>" name, i.e. publicly downloadable. Outside it, no
    // URL can reach them; Medusa still reads imports from disk by key. The
    // cost: the Admin's "download export" link returns 404 (fetch exports on
    // the server instead — see docs/DEPLOYMENT.md).
    {
      resolve: '@medusajs/medusa/file',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/file-local',
            id: 'local',
            options: {
              backend_url:
                process.env.FILE_BACKEND_URL || 'http://localhost:9000/static',
              private_upload_dir:
                process.env.PRIVATE_UPLOAD_DIR ||
                path.join(process.cwd(), 'private'),
            },
          },
        ],
      },
    },
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
              // "server" (default): we generate the OTP and text it via the
              // Notification provider below (MSG91). "firebase": Firebase
              // texts + checks the code in the browser. Must match the
              // storefront's NEXT_PUBLIC_PHONE_OTP_PROVIDER.
              mode: process.env.PHONE_OTP_PROVIDER,
              firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
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
