"use client"

import Image from "next/image"
import { Calendar, Photo } from "@medusajs/icons"
import { Heading, Text, Button } from "@modules/common/components/ui"
import { LabourService } from "@lib/data/labour-services"

/**
 * Shared between the homepage rail and the full /labour page — "Book" opens
 * the booking modal directly (no navigation), so the same card works in
 * both places unchanged.
 */
const LabourServiceCard = ({
  service,
  onBook,
}: {
  service: LabourService
  onBook: (service: LabourService) => void
}) => {
  return (
    <div className="bg-white border border-ui-border-base rounded-large overflow-hidden flex flex-col">
      <div className="relative aspect-[4/3] bg-ui-bg-subtle">
        {service.imageUrl ? (
          <Image
            src={service.imageUrl}
            alt={service.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-ui-fg-muted">
            <Photo />
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col gap-2 flex-1">
        <Heading level="h3" className="text-lg">
          {service.name}
        </Heading>
        <Text className="text-ui-fg-subtle txt-small flex-1">
          {service.description}
        </Text>
        <div className="flex items-center justify-between pt-3 mt-1 border-t border-ui-border-base">
          <div className="flex items-center gap-3">
            <div>
              <Text className="txt-small text-ui-fg-subtle">Per Day</Text>
              <Text className="text-brand-600 text-lg font-bold">
                ₹{service.perDayRate}
              </Text>
            </div>
            <div className="w-px h-8 bg-ui-border-base" aria-hidden="true" />
            <div>
              <Text className="txt-small text-ui-fg-subtle">Per Hour</Text>
              <Text className="text-gray-900 text-lg font-bold">
                ₹{service.perHourRate}
              </Text>
            </div>
          </div>
          <Button
            variant="primary"
            size="small"
            onClick={() => onBook(service)}
            data-testid={`book-${service.slug}`}
          >
            <Calendar />
            Book
          </Button>
        </div>
      </div>
    </div>
  )
}

export default LabourServiceCard
