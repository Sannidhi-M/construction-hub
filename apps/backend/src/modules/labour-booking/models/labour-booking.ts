import { model } from "@medusajs/framework/utils"

/**
 * A labour-booking request, not a Medusa order — no inventory, shipping, or
 * fulfillment involved, so this is its own small module rather than a
 * strained fit onto Cart/Order. `service_slug`/`service_name`/`rate_amount`
 * are a snapshot taken at submission time from the labour_service record (the
 * server looks them up; the browser's values are not trusted) — a later rate
 * change shouldn't retroactively alter an existing booking's record, same
 * principle as an order line item snapshotting a product's price.
 */
const LabourBooking = model.define("labour_booking", {
  id: model.id().primaryKey(),

  service_slug: model.text(),
  service_name: model.text(),
  rate_type: model.enum(["day", "hour"]),
  rate_amount: model.number(),

  // "day" bookings: both set (equal for a single-day booking).
  // "hour" bookings: both null — see scheduled_time/duration_hours instead.
  start_date: model.text().nullable(),
  end_date: model.text().nullable(),

  // "hour" bookings only.
  scheduled_time: model.text().nullable(),
  duration_hours: model.number().nullable(),

  num_workers: model.number(),

  address_1: model.text(),
  landmark: model.text().nullable(),
  city: model.text(),
  postal_code: model.text(),
  phone: model.text(),

  // Loose reference by id, same style Medusa itself uses for order<->customer
  // — no hard DB foreign key, so this module stays fully independent.
  customer_id: model.text().nullable(),
  email: model.text().nullable(),

  payment_method: model.enum(["upi", "cod"]),
  // Customer's own "I've Paid" self-report — a hint only, same semantics as
  // orders' `payment_customer_confirmed`. Never implies the admin has
  // actually received the money.
  payment_customer_confirmed: model.boolean().default(false),
  // Admin's own "Mark Payment Received" action — the real signal, distinct
  // from the customer hint above (there's no Medusa payment ledger backing
  // a booking, so this plain flag is the only source of truth for it).
  payment_received: model.boolean().default(false),

  status: model
    .enum(["requested", "confirmed", "completed", "cancelled"])
    .default("requested"),
  admin_note: model.text().nullable(),
})

export default LabourBooking
