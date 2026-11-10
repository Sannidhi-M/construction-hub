import { engineeringServices, EngineeringService } from "./engineering-services"

/**
 * The "one free service per customer" welcome offer. The backend's
 * FREE_CLAIM_SERVICE_SLUGS (apps/backend/src/modules/quote-request/
 * service-catalog.ts) is what enforces it; this mirror drives the banner and
 * the claim form, and scripts/check-synced-lists.js keeps the two equal.
 * Names are looked up from the quote picklist, so a service is only ever
 * named in one place.
 */
export const FREE_SERVICE_SLUGS = [
  "architectural-floor-plans",
  "3d-elevations-visualization",
  "structural-design-drawings",
  "interior-design-space-planning",
  "boq-quantity-estimation",
  "cost-estimation",
] as const

export const freeServices: EngineeringService[] = FREE_SERVICE_SLUGS.map(
  (slug) => {
    const service = engineeringServices.find((s) => s.slug === slug)
    if (!service) {
      throw new Error(`Free service "${slug}" is not in the quote picklist.`)
    }
    return service
  }
)

// Where "Claim your free service" goes: the Engineering quote form in claim
// mode (see app/(main)/engineering/quote/page.tsx).
export const FREE_CLAIM_HREF = "/engineering/quote?free=1"
