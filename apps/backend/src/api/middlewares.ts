import { authenticate, defineMiddlewares } from "@medusajs/framework/http"
import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { getRedisClient } from "../lib/redis"

// Looser than the per-phone limit (§3.1) — an IP can legitimately represent
// several customers behind NAT/a shared connection, but should still be
// capped well below what a script hammering the endpoint would produce.
const MAX_REQUESTS_PER_IP_PER_HOUR = 20

async function phoneAuthIpRateLimit(
  req: MedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) {
  const ip = req.ip ?? "unknown"
  const redis = getRedisClient()
  const key = `phone-otp:ip-ratelimit:${ip}`

  const count = await redis.incr(key)
  if (count === 1) {
    await redis.expire(key, 3600)
  }

  if (count > MAX_REQUESTS_PER_IP_PER_HOUR) {
    res.status(429).json({
      message: "Too many phone authentication requests from this network. Please try again later.",
    })
    return
  }

  next()
}

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
  ],
})
