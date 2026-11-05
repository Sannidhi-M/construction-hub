import { sdk } from "@lib/config"

/**
 * The labour trades customers can book (masonry, plumbing, …). They are
 * managed in the Admin ("Labour Services"), not in code, so adding a trade or
 * changing a rate needs no deploy. Only active services are returned, in the
 * order set there.
 */
export type LabourService = {
  slug: string
  name: string
  category: "Construction" | "Finishing" | "General"
  description: string
  perDayRate: number
  perHourRate: number
  minBookingHours: number
  // A storefront path or an absolute URL of a photo uploaded in the Admin;
  // null when the service has none (a placeholder is shown).
  imageUrl: string | null
}

type StoreLabourService = {
  slug: string
  name: string
  category: LabourService["category"]
  description: string
  per_day_rate: number
  per_hour_rate: number
  min_booking_hours: number
  image_url: string | null
}

// Time-based rather than tag-based: Admin edits happen in the backend, which
// the storefront never hears about, so a change shows up within a minute
// instead of waiting on a redeploy.
const REVALIDATE_SECONDS = 60

export const listLabourServices = async (): Promise<LabourService[]> => {
  const { labour_services } = await sdk.client.fetch<{
    labour_services: StoreLabourService[]
  }>("/store/labour-services", {
    next: { revalidate: REVALIDATE_SECONDS },
  })

  return labour_services.map((service) => ({
    slug: service.slug,
    name: service.name,
    category: service.category,
    description: service.description,
    perDayRate: service.per_day_rate,
    perHourRate: service.per_hour_rate,
    minBookingHours: service.min_booking_hours,
    imageUrl: service.image_url,
  }))
}
