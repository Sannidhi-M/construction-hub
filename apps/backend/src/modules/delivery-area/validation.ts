import { MedusaError } from "@medusajs/framework/utils"

/** An Indian pincode: exactly six digits. */
export const PINCODE_PATTERN = /^\d{6}$/
export const MAX_AREA_LABEL_LENGTH = 100

export const isValidPincode = (value: unknown): value is string =>
  typeof value === "string" && PINCODE_PATTERN.test(value)

const invalid = (message: string) =>
  new MedusaError(MedusaError.Types.INVALID_DATA, message)

/**
 * Trims and validates a pincode before it is stored, so a typo (or anything
 * that is not a pincode) can never become a "serviceable" entry that no
 * customer's pincode would match.
 */
export const parsePincode = (raw: unknown): string => {
  const pincode = typeof raw === "string" ? raw.trim() : ""
  if (!PINCODE_PATTERN.test(pincode)) {
    throw invalid("Pincode must be exactly 6 digits.")
  }
  return pincode
}

/** The optional area label: trimmed, empty becomes null, length-limited. */
export const parseAreaLabel = (raw: unknown): string | null => {
  if (raw === undefined || raw === null) {
    return null
  }
  if (typeof raw !== "string") {
    throw invalid("Area label must be text.")
  }
  const label = raw.trim()
  if (label.length > MAX_AREA_LABEL_LENGTH) {
    throw invalid(
      `Area label must be at most ${MAX_AREA_LABEL_LENGTH} characters.`
    )
  }
  return label || null
}
