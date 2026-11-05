import { Metadata } from "next"
import PlatformBanner from "@modules/common/components/platform-banner"
import LabourBookingGrid from "@modules/labour/components/labour-booking-grid"
import WorkContractsSection from "@modules/labour/components/work-contracts-section"
import { listLabourServices } from "@lib/data/labour-services"
import { retrieveCustomer } from "@lib/data/customer"
import { SITE_NAME } from "@lib/constants"

export const metadata: Metadata = {
  title: `Labour & Manpower | ${SITE_NAME}`,
  description: "Book skilled workers by the day or by the hour.",
}

export default async function LabourPage() {
  const [customer, labourServices] = await Promise.all([
    retrieveCustomer(),
    listLabourServices(),
  ])

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      <PlatformBanner
        eyebrow="Platform 2"
        title="Labour & Manpower"
        description="Skilled workers, booked your way. Pick a service, choose per-day or per-hour, and book in minutes — verified workers, delivered to your site."
      />
      <div className="content-container py-10">
        {labourServices.length > 0 ? (
          <LabourBookingGrid
            services={labourServices}
            customer={customer}
            gridClassName="grid grid-cols-1 xsmall:grid-cols-2 medium:grid-cols-4 gap-6"
          />
        ) : (
          <p className="text-center text-gray-500 py-10" data-testid="no-labour-services">
            No services are available to book right now. Please check back soon,
            or contact us about a complete work contract below.
          </p>
        )}
        <WorkContractsSection />
      </div>
    </div>
  )
}
