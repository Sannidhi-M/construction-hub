import { ExecArgs } from "@medusajs/framework/types"
import { LABOUR_BOOKING_MODULE } from "../modules/labour-booking"
import LabourBookingModuleService from "../modules/labour-booking/service"

/**
 * One-time seed of the labour services that used to live in a file in the
 * storefront (lib/data/labour-services.ts), so moving them into the database
 * doesn't make any service disappear. Safe to run again: a service whose slug
 * already exists is left untouched, so it never overwrites edits made in the
 * Admin.
 *
 *   npx medusa exec ./src/scripts/seed-labour-services.ts
 */
const SERVICES = [
  { slug: "masonry", name: "Masonry", category: "Construction", description: "Brickwork, plastering, flooring, and structural work.", per_day_rate: 700, per_hour_rate: 100, min_booking_hours: 4 },
  { slug: "plumbing", name: "Plumbing", category: "Construction", description: "Water supply, drainage, pipe fitting and repairs.", per_day_rate: 850, per_hour_rate: 130, min_booking_hours: 2 },
  { slug: "electrical", name: "Electrical", category: "Construction", description: "Wiring, panel work, fixtures and safety checks.", per_day_rate: 900, per_hour_rate: 140, min_booking_hours: 2 },
  { slug: "painting", name: "Painting", category: "Finishing", description: "Interior and exterior painting, texture and finishing.", per_day_rate: 700, per_hour_rate: 100, min_booking_hours: 4 },
  { slug: "carpentry", name: "Carpentry", category: "Finishing", description: "Doors, windows, furniture, and woodwork.", per_day_rate: 800, per_hour_rate: 120, min_booking_hours: 4 },
  { slug: "general-labour", name: "General Labour", category: "General", description: "Shifting, cleanup, site prep and other manual work.", per_day_rate: 550, per_hour_rate: 80, min_booking_hours: 4 },
] as const

export default async function seedLabourServices({ container }: ExecArgs) {
  const service: LabourBookingModuleService =
    container.resolve(LABOUR_BOOKING_MODULE)

  for (const [index, entry] of SERVICES.entries()) {
    const [existing] = await service.listLabourServices({ slug: entry.slug })
    if (existing) {
      console.log(`exists   ${entry.slug}`)
      continue
    }
    await service.createLabourServices({
      ...entry,
      // The photos already shipped with the storefront.
      image_url: `/images/labour/${entry.slug}.jpg`,
      is_active: true,
      sort_order: index,
    })
    console.log(`created  ${entry.slug}`)
  }
}
