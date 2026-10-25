import { ChevronRight } from "@medusajs/icons"
import { Button, Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import EngineeringSlider from "@modules/engineering/components/engineering-slider"
import { EngineeringSlide } from "@lib/data/engineering-slides"

type EngineeringServiceCardProps = {
  title: string
  description: string
  ctaHref: string
  ctaLabel?: string
  slides: EngineeringSlide[]
  autoplayMs?: number
}

/**
 * One offering as a boxed vertical card — slider on top, then title, a
 * short pitch, and the call-to-action below. Two of these sit side by side
 * on the homepage (Engineering Services / Other Services); the box keeps
 * each offering's photos, text and button visibly grouped.
 */
const EngineeringServiceCard = ({
  title,
  description,
  ctaHref,
  ctaLabel = "Get a Free Quote",
  slides,
  autoplayMs,
}: EngineeringServiceCardProps) => {
  return (
    <div
      className="flex flex-col h-full bg-gray-50 border border-gray-200 rounded-large p-5 small:p-6"
      data-testid="engineering-service-card"
    >
      <EngineeringSlider
        slides={slides}
        autoplayMs={autoplayMs}
        aspectClassName="aspect-[21/9]"
      />
      <Heading level="h3" className="text-xl font-bold text-gray-900 mt-5">
        {title}
      </Heading>
      <Text className="text-base text-gray-500 mt-2 flex-1">{description}</Text>
      <LocalizedClientLink href={ctaHref} className="inline-block self-start mt-5">
        <Button variant="primary" size="large">
          {ctaLabel}
          <ChevronRight />
        </Button>
      </LocalizedClientLink>
    </div>
  )
}

export default EngineeringServiceCard
