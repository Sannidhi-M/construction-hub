import { MetadataRoute } from "next"
import { getBaseURL } from "@lib/util/env"

/**
 * Tells search engines what to skip: the private, per-customer pages (cart,
 * checkout, account, order and booking confirmations). Everything else is
 * open, and the sitemap points them at the pages worth indexing.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseURL()

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/account",
          "/cart",
          "/checkout",
          "/order/",
          "/labour/bookings/",
          "/verify-account",
          "/api/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
