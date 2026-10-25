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
})

export default QuoteRequest
