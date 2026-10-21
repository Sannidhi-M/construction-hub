"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { LabourService } from "@lib/data/labour-services"
import LabourServiceCard from "@modules/labour/components/labour-service-card"
import BookingModal from "@modules/labour/components/booking-modal"

/**
 * Grid of service cards sharing one modal instance (rather than one modal
 * per card) — used by both the homepage rail and the full /labour page, so
 * "Book" behaves identically in both places with no navigation involved.
 */
const LabourBookingGrid = ({
  services,
  customer,
  gridClassName,
}: {
  services: LabourService[]
  customer: HttpTypes.StoreCustomer | null
  gridClassName: string
}) => {
  const [selected, setSelected] = useState<LabourService | null>(null)

  return (
    <>
      <div className={gridClassName}>
        {services.map((service) => (
          <LabourServiceCard
            key={service.slug}
            service={service}
            onBook={setSelected}
          />
        ))}
      </div>
      {selected && (
        <BookingModal
          service={selected}
          customer={customer}
          isOpen={!!selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}

export default LabourBookingGrid
