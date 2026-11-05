import { model } from "@medusajs/framework/utils"

/**
 * A labour trade offered for booking (masonry, plumbing, …), managed from the
 * Admin instead of a file in the storefront, so adding a service or changing
 * a rate needs no deploy.
 *
 * A booking does NOT reference this row for its price: it snapshots the name
 * and rate onto the booking when it is made (see LabourBooking), so editing a
 * rate here only affects bookings made afterwards.
 */
const LabourService = model.define("labour_service", {
  id: model.id().primaryKey(),

  // The stable identifier bookings store and the storefront keys on. Made
  // from the name when the service is created and never changed afterwards —
  // renaming a service must not orphan its past bookings.
  slug: model.text().unique(),
  name: model.text(),
  category: model.enum(["Construction", "Finishing", "General"]),
  description: model.text(),

  // Whole rupees, matching booking.rate_amount.
  per_day_rate: model.number(),
  per_hour_rate: model.number(),
  min_booking_hours: model.number(),

  // A storefront path ("/images/labour/masonry.jpg") for the seeded services,
  // or the URL of a photo uploaded through the Admin. Null shows a placeholder.
  image_url: model.text().nullable(),

  // Inactive services are hidden from the storefront and cannot be booked,
  // but keep their record (a way to pause a trade without deleting it).
  is_active: model.boolean().default(true),
  // Lower numbers show first.
  sort_order: model.number().default(0),
})

export default LabourService
