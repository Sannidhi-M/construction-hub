/**
 * Placeholder data for the Engineering Services platform. There is no
 * backend for this yet — no quote-request/lead data model exists (see
 * docs plan for the storefront redesign). This file is the single source
 * both the homepage rail and the /engineering page read from.
 */

export type EngineeringService = {
  slug: string
  name: string
  description: string
}

export const engineeringServices: EngineeringService[] = [
  {
    slug: "building-plans",
    name: "Building Plans",
    description:
      "Architectural drawings and 2D/3D floor plans for residential and commercial projects.",
  },
  {
    slug: "mep-plans",
    name: "MEP Plans",
    description:
      "Mechanical, electrical and plumbing drawings and specifications for your build.",
  },
  {
    slug: "site-supervision",
    name: "Site Supervision",
    description:
      "On-site engineering oversight to keep quality, safety and timelines on track.",
  },
  {
    slug: "full-home-construction",
    name: "Full Home Construction",
    description:
      "End-to-end construction from foundation to handover — tell us your requirements.",
  },
]
