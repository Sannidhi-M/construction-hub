import { MedusaError } from "@medusajs/framework/utils"

export const MAX_ADMIN_NOTE_LENGTH = 2000

/** Trims an Admin note; empty becomes undefined; over-long is refused (400). */
export function parseAdminNote(raw: unknown): string | undefined {
  if (raw === undefined || raw === null) {
    return undefined
  }
  if (typeof raw !== "string") {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "Note must be text.")
  }
  const note = raw.trim()
  if (note.length > MAX_ADMIN_NOTE_LENGTH) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `Note must be at most ${MAX_ADMIN_NOTE_LENGTH} characters.`
    )
  }
  return note || undefined
}
