/**
 * Placeholder data for the Labour & Manpower platform. There is no backend
 * for this yet — no worker/booking data model exists (see docs plan for
 * the storefront redesign). This file is the single source both the
 * homepage rail and the /labour page read from, so swapping it for a real
 * API call later only touches one place.
 */

export type LabourService = {
  slug: string
  name: string
  category: "Construction" | "Finishing" | "General"
  description: string
  perDayRate: number
  perHourRate: number
  minBookingHours: number
}

export const labourServices: LabourService[] = [
  {
    slug: "masonry",
    name: "Masonry",
    category: "Construction",
    description: "Brickwork, plastering, flooring, and structural work.",
    perDayRate: 700,
    perHourRate: 100,
    minBookingHours: 4,
  },
  {
    slug: "plumbing",
    name: "Plumbing",
    category: "Construction",
    description: "Water supply, drainage, pipe fitting and repairs.",
    perDayRate: 850,
    perHourRate: 130,
    minBookingHours: 2,
  },
  {
    slug: "electrical",
    name: "Electrical",
    category: "Construction",
    description: "Wiring, panel work, fixtures and safety checks.",
    perDayRate: 900,
    perHourRate: 140,
    minBookingHours: 2,
  },
  {
    slug: "painting",
    name: "Painting",
    category: "Finishing",
    description: "Interior and exterior painting, texture and finishing.",
    perDayRate: 700,
    perHourRate: 100,
    minBookingHours: 4,
  },
  {
    slug: "carpentry",
    name: "Carpentry",
    category: "Finishing",
    description: "Doors, windows, furniture, and woodwork.",
    perDayRate: 800,
    perHourRate: 120,
    minBookingHours: 4,
  },
  {
    slug: "general-labour",
    name: "General Labour",
    category: "General",
    description: "Shifting, cleanup, site prep and other manual work.",
    perDayRate: 550,
    perHourRate: 80,
    minBookingHours: 4,
  },
]
