import { authenticate, defineMiddlewares } from "@medusajs/framework/http"
import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getRedisClient } from "../lib/redis"

/**
 * Per-IP request limit backed by Redis — a fixed one-hour window per IP.
 * One factory so each limited endpoint gets its own counter (`keyPrefix`)
 * and its own ceiling.
 */
function createIpRateLimit({
  keyPrefix,
  maxPerHour,
  message,
}: {
  keyPrefix: string
  maxPerHour: number
  message: string
}) {
  return async function ipRateLimit(
    req: MedusaRequest,
    res: MedusaResponse,
    next: MedusaNextFunction
  ) {
    const ip = req.ip ?? "unknown"
    const redis = getRedisClient()
    const key = `${keyPrefix}:${ip}`

    const count = await redis.incr(key)
    if (count === 1) {
      await redis.expire(key, 3600)
    }

    if (count > maxPerHour) {
      res.status(429).json({ message })
      return
    }

    next()
  }
}

// Looser than the per-phone limit (§3.1) — an IP can legitimately represent
// several customers behind NAT/a shared connection, but should still be
// capped well below what a script hammering the endpoint would produce.
const phoneAuthIpRateLimit = createIpRateLimit({
  keyPrefix: "phone-otp:ip-ratelimit",
  maxPerHour: 20,
  message:
    "Too many phone authentication requests from this network. Please try again later.",
})

// The contact form is open to anyone, so this is its main abuse brake (with
// the honeypot and the workflow's validation). Low on purpose: a real person
// sends one or two messages, not five in an hour.
const contactMessageIpRateLimit = createIpRateLimit({
  keyPrefix: "contact-message:ip-ratelimit",
  maxPerHour: 5,
  message: "Too many messages sent from this network. Please try again later.",
})

// Called when a signed-out visitor submits a form that would create an
// account (and again when they ask for the OTP), so it's capped separately
// from the OTP endpoints rather than eating their budget — and higher, since
// each attempt makes two calls.
const emailConflictIpRateLimit = createIpRateLimit({
  keyPrefix: "email-conflict:ip-ratelimit",
  maxPerHour: 60,
  message: "Too many requests from this network. Please try again later.",
})

export default defineMiddlewares({
  routes: [
    {
      matcher: "/auth/customer/phone-auth*",
      middlewares: [phoneAuthIpRateLimit],
    },
    {
      matcher: "/store/customers/phone-exists",
      middlewares: [phoneAuthIpRateLimit],
    },
    {
      matcher: "/store/customers/email-conflict",
      middlewares: [emailConflictIpRateLimit],
    },
    {
      matcher: "/store/orders/:id/payment-submitted",
      middlewares: [authenticate("customer", "bearer")],
    },
    {
      matcher: "/store/labour-bookings",
      middlewares: [authenticate("customer", "bearer")],
    },
    {
      matcher: "/store/labour-bookings/:id",
      middlewares: [authenticate("customer", "bearer")],
    },
    {
      matcher: "/store/labour-bookings/:id/payment-submitted",
      middlewares: [authenticate("customer", "bearer")],
    },
    {
      matcher: "/store/quote-requests",
      middlewares: [authenticate("customer", "bearer")],
    },
    {
      matcher: "/store/quote-requests/:id",
      middlewares: [authenticate("customer", "bearer")],
    },
    {
      // Open to anyone; a signed-in customer's message is just linked to
      // their account (hence allowUnauthenticated).
      matcher: "/store/contact-messages",
      middlewares: [
        contactMessageIpRateLimit,
        authenticate("customer", "bearer", { allowUnauthenticated: true }),
      ],
    },
  ],
})
