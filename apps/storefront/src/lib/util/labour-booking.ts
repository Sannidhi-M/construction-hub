import type { LabourBooking } from "@lib/data/labour-bookings"

/**
 * Customer-facing presentation helpers for a labour booking, shared by the
 * post-booking confirmation page and the account's "My Orders" → Labour
 * card/detail views, so the same booking never shows a different status
 * color, schedule string or total depending on which page it's on (same
 * reasoning as order-status.ts's shared STATUS_BADGE_COLOR for Materials).
 */

export type BookingStatus = LabourBooking["status"]

export const BOOKING_STATUS_COLOR: Record<
  BookingStatus,
  "orange" | "blue" | "green" | "red"
> = {
  requested: "orange",
  confirmed: "blue",
  completed: "green",
  cancelled: "red",
}

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
}

// The happy-path lifecycle, in order — "cancelled" is deliberately not a
// step: it's a terminal exit from any point, not a stage after "completed".
export const BOOKING_STEPS = [
  "requested",
  "confirmed",
  "completed",
] as const satisfies readonly BookingStatus[]

export type BookingStep = (typeof BOOKING_STEPS)[number]

const MS_PER_DAY = 1000 * 60 * 60 * 24

export const bookingNumber = (booking: Pick<LabourBooking, "id">) =>
  booking.id.slice(-8).toUpperCase()

const toLocalDate = (isoDate: string) => new Date(`${isoDate}T00:00:00`)

// "17:00" -> "5:00 PM" — the booking form shows 12-hour labels, so the
// stored 24-hour value is converted back for display.
const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number)
  const period = hours >= 12 ? "PM" : "AM"
  const hours12 = hours % 12 === 0 ? 12 : hours % 12
  return `${hours12}:${String(minutes).padStart(2, "0")} ${period}`
}

const formatHours = (hours: number) => {
  const rounded = Math.round(hours * 100) / 100
  const label = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
  return `${label} hour${rounded === 1 ? "" : "s"}`
}

export const bookingDayCount = (
  booking: Pick<LabourBooking, "rate_type" | "start_date" | "end_date">
) => {
  if (booking.rate_type !== "day" || !booking.start_date || !booking.end_date) {
    return 1
  }
  const ms =
    toLocalDate(booking.end_date).getTime() -
    toLocalDate(booking.start_date).getTime()
  return Math.max(1, Math.round(ms / MS_PER_DAY) + 1)
}

export const formatBookingSchedule = (
  booking: Pick<
    LabourBooking,
    | "rate_type"
    | "start_date"
    | "end_date"
    | "scheduled_time"
    | "duration_hours"
  >
) => {
  if (!booking.start_date) {
    return ""
  }

  const start = toLocalDate(booking.start_date).toDateString()

  if (booking.rate_type === "day") {
    return booking.end_date && booking.end_date !== booking.start_date
      ? `${start} → ${toLocalDate(booking.end_date).toDateString()}`
      : start
  }

  const time = booking.scheduled_time ? ` at ${formatTime(booking.scheduled_time)}` : ""
  const duration = booking.duration_hours ? ` (${formatHours(booking.duration_hours)})` : ""
  return `${start}${time}${duration}`
}

// Not stored on the booking — an estimate, since the final price is agreed
// by phone (see ARCHITECTURE.md §2.10).
export const estimateBookingTotal = (
  booking: Pick<
    LabourBooking,
    | "rate_type"
    | "rate_amount"
    | "num_workers"
    | "start_date"
    | "end_date"
    | "duration_hours"
  >
) =>
  booking.rate_amount *
  (booking.rate_type === "day"
    ? bookingDayCount(booking)
    : booking.duration_hours ?? 1) *
  booking.num_workers

// A cancelled booking never needs paying, so it's never "awaiting payment"
// regardless of method — same as a cancelled Materials order.
export const isBookingAwaitingPayment = (
  booking: Pick<LabourBooking, "payment_method" | "payment_received" | "status">
) =>
  booking.payment_method === "upi" &&
  !booking.payment_received &&
  booking.status !== "cancelled"

export const getBookingPaymentLabel = (
  booking: Pick<
    LabourBooking,
    "payment_method" | "payment_received" | "payment_customer_confirmed"
  >
) => {
  if (booking.payment_received) {
    return "Paid"
  }
  if (booking.payment_method === "cod") {
    return "Cash on Delivery"
  }
  return booking.payment_customer_confirmed
    ? "Payment verification pending"
    : "Payment pending"
}
