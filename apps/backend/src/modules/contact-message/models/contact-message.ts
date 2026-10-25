import { model } from "@medusajs/framework/utils"

/**
 * A message sent through the public "Contact us" form — something the
 * business reads and replies to by phone/email, not an order, so (like
 * quote-request and labour-booking) it's its own small module.
 *
 * Unlike quote requests, the form is open to anyone (no OTP): `customer_id`
 * is only set when the sender happened to be signed in, and `phone` is
 * whatever they typed (required and format-validated, but not verified —
 * the business calls back on it). `topic_name` is a snapshot of the catalog
 * label at submission time (see topics.ts), so renaming a topic later
 * doesn't rewrite history.
 */
const ContactMessage = model.define("contact_message", {
  id: model.id().primaryKey(),
  topic_slug: model.text(),
  topic_name: model.text(),
  name: model.text(),
  email: model.text(),
  phone: model.text(),
  message: model.text(),
  customer_id: model.text().nullable(),
  status: model.enum(["new", "replied", "closed"]).default("new"),
  admin_note: model.text().nullable(),
})

export default ContactMessage
