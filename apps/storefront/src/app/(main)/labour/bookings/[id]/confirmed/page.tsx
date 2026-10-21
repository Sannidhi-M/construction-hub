import { notFound } from "next/navigation"
import { Metadata } from "next"
import { CheckCircleSolid } from "@medusajs/icons"
import { Badge, Heading, Text } from "@modules/common/components/ui"
import UpiPayment from "@modules/checkout/components/upi-payment"
import {
  retrieveLabourBooking,
  confirmLabourBookingPaymentSubmitted,
} from "@lib/data/labour-bookings"
import { SITE_NAME } from "@lib/constants"

export const metadata: Metadata = {
  title: `Booking Confirmed | ${SITE_NAME}`,
}

const STATUS_COLOR: Record<string, "orange" | "blue" | "green" | "red"> = {
  requested: "orange",
  confirmed: "blue",
  completed: "green",
  cancelled: "red",
}

const STATUS_LABEL: Record<string, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
}

const formatSchedule = (booking: Awaited<ReturnType<typeof retrieveLabourBooking>>) => {
  if (!booking) return ""
  if (booking.rate_type === "day") {
    return booking.start_date === booking.end_date
      ? new Date(`${booking.start_date}T00:00:00`).toDateString()
      : `${new Date(`${booking.start_date}T00:00:00`).toDateString()} → ${new Date(
          `${booking.end_date}T00:00:00`
        ).toDateString()}`
  }
  return `${new Date(`${booking.start_date}T00:00:00`).toDateString()} at ${booking.scheduled_time} (${booking.duration_hours}h)`
}

type Props = {
  params: Promise<{ id: string }>
}

export default async function LabourBookingConfirmedPage(props: Props) {
  const { id } = await props.params
  const booking = await retrieveLabourBooking(id)

  if (!booking) {
    return notFound()
  }

  const numDays =
    booking.rate_type === "day" && booking.start_date && booking.end_date
      ? Math.max(
          1,
          Math.round(
            (new Date(`${booking.end_date}T00:00:00`).getTime() -
              new Date(`${booking.start_date}T00:00:00`).getTime()) /
              (1000 * 60 * 60 * 24)
          ) + 1
        )
      : 1
  const estimatedTotal =
    booking.rate_amount *
    (booking.rate_type === "day" ? numDays : booking.duration_hours ?? 1) *
    booking.num_workers

  const awaitingPayment = booking.payment_method === "upi" && !booking.payment_received

  return (
    <div className="py-6 bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="content-container flex flex-col gap-y-6 w-full">
        <div className="bg-brand-50 border border-brand-100 rounded-lg p-6 small:p-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white mb-3">
            <CheckCircleSolid className="w-6 h-6" />
          </div>
          <Heading level="h1" className="text-2xl small:text-3xl font-bold text-gray-900">
            Booking Requested!
          </Heading>
          <Text className="text-gray-600 mt-1">
            Our team will call you shortly to confirm the details.
          </Text>
        </div>

        <div
          className={
            awaitingPayment
              ? "grid grid-cols-1 small:grid-cols-[1fr_416px] gap-6 items-start"
              : "grid grid-cols-1 gap-6"
          }
        >
          {awaitingPayment && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 small:p-10">
              <UpiPayment
                amount={estimatedTotal}
                currencyCode="inr"
                referenceLabel={`Booking #${booking.id.slice(-8).toUpperCase()}`}
                transactionNote={`Labour Booking ${booking.id}`}
                alreadyConfirmed={booking.payment_customer_confirmed}
                onConfirmPaid={confirmLabourBookingPaymentSubmitted.bind(null, booking.id)}
                viewHref={`/labour/bookings/${booking.id}/confirmed`}
                viewLabel="View Booking"
              />
            </div>
          )}

          <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-full p-6 small:p-10">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 small:p-6">
              <div className="flex flex-wrap items-start justify-between gap-y-3">
                <div className="flex flex-col gap-y-2">
                  <Text className="break-words">
                    <span className="txt-small text-ui-fg-subtle">Booking number: </span>
                    <span className="font-semibold text-brand-600">
                      #{booking.id.slice(-8).toUpperCase()}
                    </span>
                  </Text>
                  <Text className="break-words">
                    <span className="txt-small text-ui-fg-subtle">Service: </span>
                    <span className="font-semibold text-gray-900">{booking.service_name}</span>
                  </Text>
                  <Text className="break-words">
                    <span className="txt-small text-ui-fg-subtle">Schedule: </span>
                    <span className="font-semibold text-gray-900">{formatSchedule(booking)}</span>
                  </Text>
                  <Text className="break-words">
                    <span className="txt-small text-ui-fg-subtle">Workers: </span>
                    <span className="font-semibold text-gray-900">{booking.num_workers}</span>
                  </Text>
                </div>
                <Badge color={STATUS_COLOR[booking.status]}>
                  {STATUS_LABEL[booking.status]}
                </Badge>
              </div>
            </div>

            {booking.payment_method === "cod" && (
              <div
                className="flex items-center gap-x-2 bg-brand-50 border border-brand-100 rounded-md px-4 py-3 mt-4"
                data-testid="booking-cod-note"
              >
                <Text className="text-brand-700 txt-medium">
                  Cash on Delivery — pay an estimated{" "}
                  <span className="font-semibold">₹{estimatedTotal}</span> when the work is
                  done.
                </Text>
              </div>
            )}

            <div className="border-t border-gray-200 mt-6 pt-6">
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
          </div>
        </div>
      </div>
    </div>
  )
}
