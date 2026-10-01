import { PencilSquare } from "@medusajs/icons"
import { Heading, Text, Button } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SectionHeading from "@modules/home/components/section-heading"
import { engineeringServices } from "@lib/data/engineering-services"

const EngineeringPreview = () => {
  return (
    <div className="w-full bg-white">
      <div className="content-container py-16">
        <SectionHeading
          eyebrow="Platform 3"
          title="Engineering Services"
          description="From architectural drawings to complete home construction — our engineers handle every stage of your project."
          viewAllHref="/engineering"
          viewAllLabel="Get a free quote"
        />
        <div className="grid grid-cols-1 xsmall:grid-cols-2 medium:grid-cols-4 gap-6">
          {engineeringServices.map((service) => (
            <div
              key={service.slug}
              className="bg-white border border-ui-border-base rounded-large p-6 flex flex-col gap-3"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-50 text-brand-600">
                <PencilSquare />
              </div>
              <Heading level="h3" className="text-lg">
                {service.name}
              </Heading>
              <Text className="text-ui-fg-subtle txt-small flex-1">
                {service.description}
              </Text>
              <LocalizedClientLink href="/contact">
                <Button variant="secondary" size="small" className="w-full">
                  Enquire
                </Button>
              </LocalizedClientLink>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default EngineeringPreview
