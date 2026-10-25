/**
 * The "Subject" picklist of the contact form — the authoritative list: the
 * create workflow rejects any slug not in here and snapshots the `name` from
 * here rather than trusting one sent by the client.
 *
 * Mirrored by the storefront's picklist (apps/storefront/src/lib/data/
 * contact-topics.ts). The two apps can't share a module, so adding or
 * renaming a topic means editing both files (same tradeoff as the quote
 * service catalog).
 */
export const CONTACT_TOPICS = [
  { slug: "materials", name: "Construction Materials" },
  { slug: "labour", name: "Labour & Manpower" },
  { slug: "engineering", name: "Engineering Services" },
  { slug: "order-payment-help", name: "Order or payment help" },
  { slug: "other", name: "Other" },
] as const

export type ContactTopicSlug = (typeof CONTACT_TOPICS)[number]["slug"]
