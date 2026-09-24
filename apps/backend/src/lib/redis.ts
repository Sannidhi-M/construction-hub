import Redis from "ioredis"

let client: Redis | undefined

/**
 * Shared Redis client for short-lived counters (OTP cooldown/rate-limit/
 * attempts, per-IP rate limiting) that a stateless JWT can't provide on its
 * own. A single long-lived connection, not one per call site.
 */
export function getRedisClient(): Redis {
  if (!client) {
    client = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
      maxRetriesPerRequest: 3,
    })
  }

  return client
}
