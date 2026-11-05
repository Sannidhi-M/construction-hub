import { HttpTypes } from "@medusajs/types"
import SectionHeading from "@modules/home/components/section-heading"
import LabourBookingGrid from "@modules/labour/components/labour-booking-grid"
import { listLabourServices } from "@lib/data/labour-services"

const LabourPreview = async ({
  customer,
}: {
  customer: HttpTypes.StoreCustomer | null
}) => {
  const labourServices = await listLabourServices()

  // Nothing to book (all paused): leave the section out rather than show an
  // empty heading.
  if (labourServices.length === 0) {
    return null
  }

  return (
    // #F3F4F6 — matches the Airo reference's own "Platform 2" section
    // background exactly (confirmed from its computed styles), the one
    // section on the homepage that isn't plain white.
    <div className="w-full bg-[#F3F4F6]">
      <div className="content-container py-16">
        <SectionHeading
          eyebrow="Platform 2"
          title="Labour & Manpower"
          description="Skilled workers available on hourly or daily basis, verified and background-checked."
          viewAllHref="/labour"
        />
        <LabourBookingGrid
          services={labourServices.slice(0, 4)}
          customer={customer}
          gridClassName="grid grid-cols-1 xsmall:grid-cols-2 medium:grid-cols-4 gap-6"
        />
      </div>
    </div>
  )
}

export default LabourPreview
