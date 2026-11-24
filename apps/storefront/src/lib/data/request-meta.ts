"use server"

import { headers } from "next/headers"

/**
 * The visitor's IP address, for the backend's per-IP limits (OTP requests,
 * contact form…). Those calls are made by this Next.js server, so without it
 * the backend would see one address — this server's — for every customer, and
 * a limit like "5 contact messages per hour" would apply to the whole site at
 * once.
 *
 * In production Caddy sets X-Forwarded-For to the real client address; the
 * last entry is the one Caddy added, so a visitor can't spoof it by sending
 * their own header. Returns undefined outside a request (e.g. at build time)
 * or when there's no proxy in front (local development).
 */
export async function getClientIp(): Promise<string | undefined> {
  try {
    const forwardedFor = (await headers()).get("x-forwarded-for")
    const last = forwardedFor?.split(",").pop()?.trim()
    return last || undefined
  } catch {
    return undefined
  }
}
