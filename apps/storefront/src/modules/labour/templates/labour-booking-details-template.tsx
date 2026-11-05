import { XMark } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import UpiPayment from "@modules/checkout/components/upi-payment"
import BookingTracker from "@modules/labour/components/booking-tracker"
import DetailField from "@modules/common/components/detail-field"
import Help from "@modules/order/components/help"
import { Badge, Heading, Text } from "@modules/common/components/ui"
import {
  confirmLabourBookingPaymentSubmitted,
  LabourBooking,
} from "@lib/data/labour-bookings"
import { convertToLocale } from "@lib/util/money"
import {
  BOOKING_STATUS_COLOR,
  BOOKING_STATUS_LABEL,
  bookingNumber,
  estimateBookingTotal,
  formatBookingSchedule,
  getBookingPaymentLabel,
  isBookingAwaitingPayment,
} from "@lib/util/labour-booking"

// Server Component on purpose (like order-completed-template.tsx): the
// UPI "I've Paid" action is passed to a Client Component below, and across
// that server→client boundary it must be a real Server Action reference
// (via .bind), not a closure wrapping one.
const LabourBookingDetailsTemplate = ({ booking }: { booking: LabourBooking }) => {
  const estimatedTotal = estimateBookingTotal(booking)

  return (
    <div className="flex flex-col justify-center gap-y-4">
      <div className="flex gap-2 justify-between items-center">
        <h1 className="text-2xl-semi">Booking details</h1>
        <LocalizedClientLink
          href="/account/orders?tab=labour"
          className="flex gap-2 items-center text-ui-fg-subtle hover:text-ui-fg-base"
          data-testid="back-to-overview-button"
        >
          <XMark /> Back to overview
        </LocalizedClientLink>
      </div>

      <div
        className="flex flex-col gap-4 h-full bg-white w-full"
        data-testid="booking-details-container"
      >
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 small:p-6">
          <div className="flex flex-wrap items-start justify-between gap-y-3">
            <div className="flex flex-col gap-y-2">
              <DetailField label="Booking number" value={`#${bookingNumber(booking)}`} highlight />
              <DetailField label="Booked on" value={new Date(booking.created_at).toDateString()} />
              <DetailField label="Service" value={booking.service_name} />
              <DetailField label="Schedule" value={formatBookingSchedule(booking)} />
              <DetailField label="Workers" value={String(booking.num_workers)} />
              <DetailField label="Payment" value={getBookingPaymentLabel(booking)} />
              <DetailField
                label="Estimated total"
                value={convertToLocale({ amount: estimatedTotal, currency_code: "inr" })}
              />
            </div>
            <Badge
              color={BOOKING_STATUS_COLOR[booking.status]}
              data-testid="booking-status"
            >
              {BOOKING_STATUS_LABEL[booking.status]}
            </Badge>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <Heading level="h2" className="text-3xl-regular mb-4">
            Booking status
          </Heading>
          <BookingTracker status={booking.status} />
        </div>

        {booking.payment_method === "cod" && booking.status !== "cancelled" && (
          <div
            className="flex items-center gap-x-2 bg-brand-50 border border-brand-100 rounded-md px-4 py-3"
            data-testid="booking-cod-note"
          >
            <Text className="text-brand-700 txt-medium">
              Pay in cash when the work is done — estimated{" "}
              <span className="font-semibold">
                {convertToLocale({ amount: estimatedTotal, currency_code: "inr" })}
              </span>
              .
            </Text>
          </div>
        )}

        {isBookingAwaitingPayment(booking) && (
          <div className="border-t border-gray-200 pt-4">
            <UpiPayment
              amount={estimatedTotal}
              currencyCode="inr"
              referenceLabel={`Booking #${bookingNumber(booking)}`}
              transactionNote={`Labour Booking ${booking.id}`}
              alreadyConfirmed={booking.payment_customer_confirmed}
              onConfirmPaid={confirmLabourBookingPaymentSubmitted.bind(null, booking.id)}
              viewHref={`/account/orders/labour/${booking.id}`}
              viewLabel="View Booking"
            />
          </div>
        )}

        <div className="border-t border-gray-200 pt-6">
          <Heading level="h2" className="text-3xl-regular mb-4">
            Address
          </Heading>
          <Text className="txt-medium text-ui-fg-subtle">
            {booking.address_1}
            {booking.landmark ? `, near ${booking.landmark}` : ""}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {booking.city}, {booking.postal_code}
          </Text>
          <Text className="txt-medium text-ui-fg-subtle mt-2">
            Contact: {booking.phone}
            {booking.email ? ` • ${booking.email}` : ""}
          </Text>
        </div>

        <Help />
      </div>
    </div>
  )
}

export default LabourBookingDetailsTemplate
