import { retrieveLabourBooking } from "@lib/data/labour-bookings"
import { bookingNumber } from "@lib/util/labour-booking"
import LabourBookingDetailsTemplate from "@modules/labour/templates/labour-booking-details-template"
import { Metadata } from "next"
import { notFound } from "next/navigation"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const booking = await retrieveLabourBooking(params.id)

  if (!booking) {
    notFound()
  }

  return {
    title: `Booking #${bookingNumber(booking)}`,
    description: "View your labour booking",
  }
}

export default async function LabourBookingDetailPage(props: Props) {
  const params = await props.params
  // null covers both a nonexistent booking and one that isn't the signed-in
  // customer's own — the backend route enforces ownership.
  const booking = await retrieveLabourBooking(params.id)

  if (!booking) {
    notFound()
  }

  return <LabourBookingDetailsTemplate booking={booking} />
}
