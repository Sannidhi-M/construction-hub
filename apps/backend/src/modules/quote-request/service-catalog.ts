/**
 * The services a quote can be requested for — the authoritative list: the
 * create workflow rejects any slug not in here, and snapshots the `name`
 * from here rather than trusting one sent by the client.
 *
 * Mirrored by the storefront's picklist (apps/storefront/src/lib/data/
 * engineering-services.ts). The two apps can't share a module, so adding or
 * renaming a service means editing both files — same accepted tradeoff as
 * MIN_ORDER_VALUE_INR being duplicated across both apps' env.
 */
export const QUOTE_SERVICES = [
  { slug: "architectural-floor-plans", name: "Architectural Floor Plans" },
  { slug: "3d-elevations-visualization", name: "3D Elevations & Visualization" },
  { slug: "structural-design-drawings", name: "Structural Design & Drawings" },
  { slug: "interior-design-space-planning", name: "Interior Design & Space Planning" },
  { slug: "boq-quantity-estimation", name: "BOQ & Quantity Estimation" },
  { slug: "cost-estimation", name: "Construction Cost Estimation" },
  { slug: "property-valuation-assessment", name: "Property Valuation & Assessment" },
  { slug: "turnkey-construction", name: "Turnkey Construction & Renovation" },
  { slug: "other", name: "Other" },
  // "Other Services" form's picklist (a separate section on the storefront).
  { slug: "precast-compound-walls", name: "Precast Compound Walls" },
  { slug: "steel-fabrication", name: "Steel Fabrication" },
  { slug: "ms-steel-gates-grills", name: "MS/Steel Gates & Grills" },
  { slug: "upvc-aluminium-doors-windows", name: "UPVC & Aluminium Doors, Windows & Partitions" },
  { slug: "glass-glazing-works", name: "Glass & Glazing Works" },
  { slug: "waterproofing", name: "Waterproofing" },
  { slug: "roofing-works", name: "Roofing Works" },
  { slug: "solar-water-heaters", name: "Solar Water Heaters" },
] as const

export type QuoteServiceSlug = (typeof QUOTE_SERVICES)[number]["slug"]
