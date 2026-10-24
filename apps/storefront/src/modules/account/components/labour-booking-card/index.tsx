import Image from "next/image"
import { Badge } from "@modules/common/components/ui"
import { ChevronRight } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { LabourBooking } from "@lib/data/labour-bookings"
import {
  BOOKING_STATUS_COLOR,
  BOOKING_STATUS_LABEL,
  bookingNumber,
  estimateBookingTotal,
  formatBookingSchedule,
} from "@lib/util/labour-booking"

// Same compact row as the Materials OrderCard (thumbnail · title · price /
// status, whole row is the link) so both tabs read as one consistent list.
const LabourBookingCard = ({ booking }: { booking: LabourBooking }) => {
  return (
    <LocalizedClientLink
      href={`/account/orders/labour/${booking.id}`}
      className="group flex items-center gap-x-4 small:gap-x-6 bg-white border border-gray-200 rounded-lg p-3 small:p-4 hover:border-gray-300 hover:shadow-md transition-shadow"
      data-testid="labour-booking-card"
    >
      <div className="relative w-16 small:w-20 aspect-square shrink-0 overflow-hidden rounded-large bg-ui-bg-subtle">
        <Image
          src={`/images/labour/${booking.service_slug}.jpg`}
          alt={booking.service_name}
          fill
          sizes="80px"
          className="object-cover object-center"
          draggable={false}
        />
      </div>

      <div className="flex flex-1 min-w-0 flex-col gap-y-1">
        <span className="text-base-semi text-gray-900 truncate">
          {booking.service_name}
        </span>
        <span className="text-small-regular text-ui-fg-subtle">
          {formatBookingSchedule(booking)}
        </span>
        <span className="text-small-regular text-ui-fg-subtle">
          Booking #<span data-testid="booking-number">{bookingNumber(booking)}</span>
          {" · "}
          {`${booking.num_workers} ${booking.num_workers > 1 ? "workers" : "worker"}`}
        </span>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-y-2">
        <span className="text-base-semi text-gray-900" data-testid="booking-amount">
          {convertToLocale({
            amount: estimateBookingTotal(booking),
            currency_code: "inr",
          })}
        </span>
        <Badge
          color={BOOKING_STATUS_COLOR[booking.status]}
          data-testid="booking-status"
        >
          {BOOKING_STATUS_LABEL[booking.status]}
        </Badge>
      </div>

      <ChevronRight
        className="hidden small:block shrink-0 text-gray-400 group-hover:text-gray-600"
        data-testid="booking-details-link"
      />
    </LocalizedClientLink>
  )
}

export default LabourBookingCard
