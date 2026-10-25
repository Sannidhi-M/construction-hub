import CancelledNotice from "@modules/common/components/cancelled-notice"
import StatusTracker from "@modules/common/components/status-tracker"
import {
  BOOKING_STATUS_LABEL,
  BOOKING_STEPS,
  BookingStatus,
  BookingStep,
} from "@lib/util/labour-booking"

const STEP_HINT: Record<BookingStep, string> = {
  requested: "We've received your request",
  confirmed: "Our team has confirmed your booking",
  completed: "The work is done",
}

/**
 * Progress tracker for a labour booking's admin-driven lifecycle
 * (requested → confirmed → completed). A cancelled booking isn't a step on
 * that path, so it replaces the tracker with a single cancelled notice.
 */
const BookingTracker = ({ status }: { status: BookingStatus }) => {
  if (status === "cancelled") {
    return (
      <CancelledNotice
        message="This booking was cancelled."
        testId="booking-tracker-cancelled"
      />
    )
  }

  return (
    <StatusTracker
      testIdPrefix="booking"
      currentIndex={BOOKING_STEPS.indexOf(status)}
      steps={BOOKING_STEPS.map((step) => ({
        key: step,
        label: BOOKING_STATUS_LABEL[step],
        hint: STEP_HINT[step],
      }))}
    />
  )
}

export default BookingTracker
