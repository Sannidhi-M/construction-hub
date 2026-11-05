import { Button } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { LabourBooking } from "@lib/data/labour-bookings"
import LabourBookingCard from "../labour-booking-card"

const LabourBookingOverview = ({
  bookings,
  serviceImages,
}: {
  bookings: LabourBooking[]
  // slug -> photo URL of the service as it is now
  serviceImages: Record<string, string | null>
}) => {
  if (bookings.length) {
    return (
      <div className="flex flex-col gap-y-3 w-full">
        {bookings.map((booking) => (
          <LabourBookingCard
            key={booking.id}
            booking={booking}
            imageUrl={serviceImages[booking.service_slug]}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className="w-full flex flex-col items-center gap-y-4"
      data-testid="no-bookings-container"
    >
      <h2 className="text-large-semi">Nothing to see here</h2>
      <p className="text-base-regular">
        You haven&apos;t booked any workers yet.
      </p>
      <div className="mt-4">
        <LocalizedClientLink href="/labour" passHref>
          <Button data-testid="book-labour-button">Book labour</Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default LabourBookingOverview
