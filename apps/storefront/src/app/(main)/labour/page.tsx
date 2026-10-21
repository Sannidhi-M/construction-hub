import { Metadata } from "next"
import { Heading, Text } from "@modules/common/components/ui"
import LabourBookingGrid from "@modules/labour/components/labour-booking-grid"
import { labourServices } from "@lib/data/labour-services"
import { retrieveCustomer } from "@lib/data/customer"
import { SITE_NAME } from "@lib/constants"

export const metadata: Metadata = {
  title: `Labour & Manpower | ${SITE_NAME}`,
  description: "Book skilled workers by the day or by the hour.",
}

export default async function LabourPage() {
  const customer = await retrieveCustomer()

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="bg-gray-900 text-white py-12">
        <div className="content-container">
          <Text className="text-brand-400 txt-small-plus uppercase tracking-wide mb-2">
            Labour & Manpower
          </Text>
          <Heading level="h1" className="text-3xl small:text-4xl font-bold">
            Skilled workers, booked your way
          </Heading>
          <Text className="text-gray-300 mt-2 max-w-xl">
            Pick a service, choose per-day or per-hour, and book in minutes —
            verified workers, delivered to your site.
          </Text>
        </div>
      </div>
      <div className="content-container py-10">
        <LabourBookingGrid
          services={labourServices}
          customer={customer}
          gridClassName="grid grid-cols-1 xsmall:grid-cols-2 medium:grid-cols-3 gap-6"
        />
      </div>
    </div>
  )
}
