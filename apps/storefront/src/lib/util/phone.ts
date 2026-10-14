import { parsePhoneNumberFromString } from "libphonenumber-js"

/**
 * India-only for now (per business scope) — every phone field normalizes
 * against the IN region and is stored as E.164 (+91XXXXXXXXXX), regardless
 * of whether the customer typed a bare 10-digit number or one with a
 * country code. Returns null for anything that isn't a valid Indian number.
 */
export function normalizeIndianPhone(raw: string): string | null {
  const phoneNumber = parsePhoneNumberFromString(raw, "IN")

  if (!phoneNumber || !phoneNumber.isValid() || phoneNumber.country !== "IN") {
    return null
  }

  return phoneNumber.number
}
