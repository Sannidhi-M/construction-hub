import { CheckCircleSolid, XCircleSolid } from "@medusajs/icons"
import { Text } from "@modules/common/components/ui"
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
 * that path — it's a terminal exit from any point — so it replaces the
 * tracker with a single cancelled state instead of graying out the steps.
 */
const BookingTracker = ({ status }: { status: BookingStatus }) => {
  if (status === "cancelled") {
    return (
      <div
        className="flex items-center gap-x-3 bg-red-50 border border-red-100 rounded-md px-4 py-3"
        data-testid="booking-tracker-cancelled"
      >
        <XCircleSolid className="w-5 h-5 text-red-500 shrink-0" />
        <Text className="text-red-700 txt-medium">
          This booking was cancelled.
        </Text>
      </div>
    )
  }

  const currentIndex = BOOKING_STEPS.indexOf(status)

  return (
    <ol
      className="flex flex-col small:flex-row gap-4 small:gap-0"
      data-testid="booking-tracker"
    >
      {BOOKING_STEPS.map((step, index) => {
        const reached = index <= currentIndex
        const isCurrent = index === currentIndex

        return (
          <li
            key={step}
            className="flex small:flex-1 small:flex-col items-center small:items-start gap-3 small:gap-2"
            data-testid={`booking-step-${step}`}
            aria-current={isCurrent ? "step" : undefined}
          >
            <div className="flex items-center small:w-full">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  reached
                    ? "bg-brand-500 text-white"
                    : "bg-gray-100 text-gray-400 border border-gray-200"
                }`}
              >
                {reached ? (
                  <CheckCircleSolid className="w-4 h-4" />
                ) : (
                  <span className="txt-small-plus">{index + 1}</span>
                )}
              </span>
              {index < BOOKING_STEPS.length - 1 && (
                <span
                  className={`hidden small:block h-0.5 flex-1 mx-2 ${
                    index < currentIndex ? "bg-brand-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
            <div className="flex flex-col">
              <Text
                className={`txt-medium-plus ${
                  reached ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {BOOKING_STATUS_LABEL[step]}
              </Text>
              <Text
                className={`txt-small ${
                  reached ? "text-ui-fg-subtle" : "text-gray-400"
                }`}
              >
                {STEP_HINT[step]}
              </Text>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export default BookingTracker
