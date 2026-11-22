import { MedusaError } from "@medusajs/framework/utils"

export const LABOUR_BOOKING_STATUSES = [
  "requested",
  "confirmed",
  "completed",
  "cancelled",
] as const

export type LabourBookingStatus = (typeof LABOUR_BOOKING_STATUSES)[number]

/**
 * Which status each status may move to (staying on the same status is always
 * allowed, e.g. to update the note). Completed can go back to confirmed and
 * cancelled back to requested, as undos for a mistaken click. Mirrored by the
 * Admin page's
 * dropdown (src/admin/routes/labour-bookings/page.tsx), which only offers
 * these.
 */
export const LABOUR_BOOKING_TRANSITIONS: Record<
  LabourBookingStatus,
  readonly LabourBookingStatus[]
> = {
  requested: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: ["confirmed"],
  cancelled: ["requested"],
}

export const isLabourBookingStatus = (
  value: unknown
): value is LabourBookingStatus =>
  (LABOUR_BOOKING_STATUSES as readonly unknown[]).includes(value)

/** Throws a 400 for an unknown status or a move that is not allowed. */
export const assertStatusTransition = (from: string, to: unknown): void => {
  if (!isLabourBookingStatus(to)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `'status' must be one of: ${LABOUR_BOOKING_STATUSES.join(", ")}.`
    )
  }
  if (from === to) {
    return
  }
  if (!LABOUR_BOOKING_TRANSITIONS[from as LabourBookingStatus]?.includes(to)) {
    const allowed = LABOUR_BOOKING_TRANSITIONS[from as LabourBookingStatus] ?? []
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      allowed.length
        ? `A ${from} booking can only change to: ${allowed.join(", ")}.`
        : `A ${from} booking cannot be changed to another status.`
    )
  }
}
