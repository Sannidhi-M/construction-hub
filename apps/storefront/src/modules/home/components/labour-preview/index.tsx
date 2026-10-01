import Image from "next/image"
import { Calendar } from "@medusajs/icons"
import { Heading, Text, Button } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SectionHeading from "@modules/home/components/section-heading"
import { labourServices } from "@lib/data/labour-services"

const LabourPreview = () => {
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
        <div className="grid grid-cols-1 xsmall:grid-cols-2 medium:grid-cols-4 gap-6">
          {labourServices.slice(0, 4).map((service) => (
            <div
              key={service.slug}
              className="bg-white border border-ui-border-base rounded-large overflow-hidden flex flex-col"
            >
              <div className="relative aspect-[4/3] bg-ui-bg-subtle">
                <Image
                  src={`/images/labour/${service.slug}.jpg`}
                  alt={service.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
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
                  <LocalizedClientLink href="/contact">
                    <Button variant="primary" size="small">
                      <Calendar />
                      Book
                    </Button>
                  </LocalizedClientLink>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LabourPreview
