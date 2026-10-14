import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { parsePhoneNumberFromString } from "libphonenumber-js"

/**
 * Lets the Sign In page check whether a phone number has an account
 * *before* sending an OTP for it — so a first-time visitor sees "no
 * account" immediately instead of verifying a code only to be told that
 * afterwards. Checkout's own phone step deliberately does NOT use this:
 * it lets a brand-new number sign up inline, which is the point there.
 *
 * Rate-limited by the same per-IP limiter as /auth/customer/phone-auth
 * (see middlewares.ts) — this endpoint lets anyone check whether a given
 * phone number has an account here, so it's capped the same way.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const rawPhone = req.query.phone as string | undefined

  if (!rawPhone) {
    res.status(400).json({ message: "Phone number is required." })
    return
  }

  const phoneNumber = parsePhoneNumberFromString(rawPhone, "IN")
  if (!phoneNumber || !phoneNumber.isValid()) {
    res.json({ exists: false })
    return
  }

  // Match both the normalized E.164 form and the bare national number:
  // customer.phone wasn't written consistently before this normalized on
  // every write path, so older accounts can still be stored either way.
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id"],
    filters: { phone: [phoneNumber.number, phoneNumber.nationalNumber] },
  })

  res.json({ exists: customers.length > 0 })
}
