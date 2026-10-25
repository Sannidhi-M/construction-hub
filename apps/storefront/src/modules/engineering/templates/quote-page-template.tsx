import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@modules/common/components/ui"
import QuoteForm from "@modules/engineering/components/quote-form"
import { EngineeringService } from "@lib/data/engineering-services"

/**
 * Hero band + quote form, shared by the "Engineering Services" and "Other
 * Services" quote pages — they differ only in the heading copy and the
 * picklist.
 */
const QuotePageTemplate = ({
  eyebrow,
  description,
  services,
  customer,
}: {
  eyebrow: string
  description: string
  services: EngineeringService[]
  customer: HttpTypes.StoreCustomer | null
}) => {
  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="bg-gray-900 text-white py-12">
        <div className="content-container">
          <Text className="text-brand-400 txt-small-plus uppercase tracking-wide mb-2">
            {eyebrow}
          </Text>
          <Heading level="h1" className="text-3xl small:text-4xl font-bold">
            Get a free quote
          </Heading>
          <Text className="text-gray-300 mt-2 max-w-xl">{description}</Text>
        </div>
      </div>
      <div className="content-container py-10">
        <div className="max-w-2xl mx-auto">
          <QuoteForm customer={customer} services={services} />
        </div>
      </div>
    </div>
  )
}

export default QuotePageTemplate
