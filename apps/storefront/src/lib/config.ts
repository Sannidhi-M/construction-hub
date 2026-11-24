import { getLocaleHeader } from "@lib/util/get-locale-header"
import { getClientIp } from "@lib/data/request-meta"
import Medusa, { FetchArgs, FetchInput } from "@medusajs/js-sdk"

const isServer = typeof window === "undefined"

// The browser uses the public backend address. This Next.js server prefers
// MEDUSA_BACKEND_URL when set: in production that's the backend's address on
// the server's private Docker network (deploy/docker-compose.yml), which
// avoids a round trip out through the internet and HTTPS. Not NEXT_PUBLIC_,
// so it never reaches the browser bundle. Defaults to the standard local port.
const MEDUSA_BACKEND_URL =
  (isServer && process.env.MEDUSA_BACKEND_URL) ||
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  "http://localhost:9000"

export const sdk = new Medusa({
  baseUrl: MEDUSA_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
})

const originalFetch = sdk.client.fetch.bind(sdk.client)

sdk.client.fetch = async <T>(
  input: FetchInput,
  init?: FetchArgs
): Promise<T> => {
  const headers = init?.headers ?? {}
  let localeHeader: Record<string, string | null> | undefined
  try {
    localeHeader = await getLocaleHeader()
    headers["x-medusa-locale"] ??= localeHeader["x-medusa-locale"]
  } catch {}

  // Calls made by this server on a visitor's behalf carry the visitor's IP,
  // so the backend's per-IP limits apply per visitor (see getClientIp).
  if (isServer) {
    const clientIp = await getClientIp()
    if (clientIp) {
      headers["x-forwarded-for"] ??= clientIp
    }
  }

  const newHeaders = {
    ...localeHeader,
    ...headers,
  }
  init = {
    ...init,
    headers: newHeaders,
  }
  return originalFetch(input, init)
}
