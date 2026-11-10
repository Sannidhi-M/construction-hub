import { model } from "@medusajs/framework/utils"

/**
 * An Engineering Services "Get a free quote" request — a lead the business
 * follows up by phone, not a Medusa order, so (like labour-booking) it's its
 * own small module. `service_name` is a snapshot of the catalog label at
 * submission time (see service-catalog.ts), so renaming a service later
 * doesn't rewrite the history of existing requests.
 *
 * `phone` is always the *verified* phone of the authenticated customer who
 * submitted it (taken from their customer record, never from the request
 * body) — see create-quote-request.ts.
 *
 * `is_free_claim` marks the request that used the customer's one free
 * service. A partial unique index allows at most one per customer, so two
 * simultaneous claims can't both succeed whatever the code above does.
 * Voiding a claim (Admin) sets it back to false, which frees the slot.
 */
const QuoteRequest = model.define("quote_request", {
  id: model.id().primaryKey(),
  service_slug: model.text(),
  service_name: model.text(),
  name: model.text(),
  email: model.text(),
  phone: model.text(),
  notes: model.text().nullable(),
  customer_id: model.text(),
  status: model.enum(["new", "contacted", "quoted", "closed"]).default("new"),
  admin_note: model.text().nullable(),
  is_free_claim: model.boolean().default(false),
}).indexes([
  {
    on: ["customer_id"],
    unique: true,
    where: "is_free_claim = true AND deleted_at IS NULL",
  },
])

export default QuoteRequest
