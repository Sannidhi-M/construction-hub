import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { parsePhoneNumberFromString } from "libphonenumber-js"

/**
 * Tells a signed-out visitor, BEFORE any OTP is sent, whether the email they
 * typed would block creating their account.
 *
 * Signing up with a brand-new phone number creates an account from the
 * email on the form, and Medusa refuses if another account already has that
 * email. That used to surface only after the visitor had requested and
 * entered an OTP. This lets the form say so up front instead.
 *
 * There is a conflict only when the email belongs to an account whose phone
 * is NOT the one being verified: if it's the same number, the OTP simply
 * signs them in to that account and nothing is created, so nothing can clash.
 *
 * Rate-limited per IP (see middlewares.ts). Like phone-exists this is a mild
 * enumeration surface — anyone can learn that an email is registered here —
 * accepted for the same reasons and bounded by the same kind of limit.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const rawEmail = (req.query.email as string | undefined)?.trim()
  const rawPhone = req.query.phone as string | undefined

  if (!rawEmail || !rawPhone) {
    res.status(400).json({ message: "Email and phone number are required." })
    return
  }

  const phoneNumber = parsePhoneNumberFromString(rawPhone, "IN")
  if (!phoneNumber || !phoneNumber.isValid()) {
    // Nothing to compare against; the form validates the phone itself.
    res.json({ conflict: false })
    return
  }

  // Only accounts conflict — a guest record (has_account = false) with the
  // same email does not stop a new account being created.
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "email", "phone"],
    filters: {
      email: [rawEmail, rawEmail.toLowerCase()],
      has_account: true,
    },
  })

  // customer.phone is stored in more than one format (see phone-exists), so
  // compare normalized forms rather than raw strings. An account with no
  // phone at all still holds the email, so it counts as a conflict.
  const conflict = customers.some((customer) => {
    const stored = customer.phone
      ? parsePhoneNumberFromString(customer.phone, "IN")?.number
      : undefined
    return stored !== phoneNumber.number
  })

  res.json({ conflict })
}
