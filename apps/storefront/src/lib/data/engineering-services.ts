/**
 * The services a free quote can be requested for — the picklists of the two
 * quote forms: "Engineering Services" (/engineering/quote) and "Other
 * Services" (/engineering/other-services/quote). Mirrors the backend's
 * authoritative list (apps/backend/src/modules/quote-request/
 * service-catalog.ts), which is what actually validates a submission; the
 * two apps can't share a module, so adding or renaming a service means
 * editing both files.
 */

export type EngineeringService = {
  slug: string
  name: string
}

export const engineeringServices: EngineeringService[] = [
  { slug: "architectural-floor-plans", name: "Architectural Floor Plans" },
  { slug: "3d-elevations-visualization", name: "3D Elevations & Visualization" },
  { slug: "structural-design-drawings", name: "Structural Design & Drawings" },
  { slug: "interior-design-space-planning", name: "Interior Design & Space Planning" },
  { slug: "boq-quantity-estimation", name: "BOQ & Quantity Estimation" },
  { slug: "cost-estimation", name: "Cost Estimation" },
  { slug: "property-valuation-assessment", name: "Property Valuation & Assessment" },
  {
    slug: "turnkey-construction",
    name: "Complete Turnkey Construction – Foundation to Finishing",
  },
  { slug: "other", name: "Other" },
]

export const otherServices: EngineeringService[] = [
  { slug: "precast-compound-walls", name: "Precast Compound Walls" },
  { slug: "steel-fabrication", name: "Steel Fabrication" },
  { slug: "ms-steel-gates-grills", name: "MS/Steel Gates & Grills" },
  { slug: "aluminium-works", name: "Aluminium Works" },
  { slug: "upvc-doors-windows", name: "UPVC Doors & Windows" },
  { slug: "glass-glazing-works", name: "Glass & Glazing Works" },
  { slug: "waterproofing", name: "Waterproofing" },
  { slug: "roofing-works", name: "Roofing Works" },
]
