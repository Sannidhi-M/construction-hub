/**
 * The "Subject" picklist of the /contact form. Mirrors the backend's
 * authoritative list (apps/backend/src/modules/contact-message/topics.ts),
 * which is what actually validates a submission; the two apps can't share a
 * module, so adding or renaming a topic means editing both files.
 */

export type ContactTopic = {
  slug: string
  name: string
}

export const contactTopics: ContactTopic[] = [
  { slug: "materials", name: "Construction Materials" },
  { slug: "labour", name: "Labour & Manpower" },
  { slug: "engineering", name: "Engineering Services" },
  { slug: "order-payment-help", name: "Order or payment help" },
  { slug: "other", name: "Other" },
]
