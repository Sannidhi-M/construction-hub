import { ReactNode } from "react"
import { ChevronRight } from "@medusajs/icons"
import { Button, Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type EngineeringServiceCardProps = {
  title: string
  description: string
  ctaHref: string
  ctaLabel?: string
  // The slider (or whatever picture area) at the top of the card — passed in
  // because the two offerings use different sliders.
  media: ReactNode
}

/**
 * One offering as a boxed vertical card — media on top, then title, a short
 * pitch, and the call-to-action below. Two of these sit side by side on the
 * homepage (Engineering Services / Other Services); the box keeps each
 * offering's media, text and button visibly grouped.
 */
const EngineeringServiceCard = ({
  title,
  description,
  ctaHref,
  ctaLabel = "Get a Free Quote",
  media,
}: EngineeringServiceCardProps) => {
  return (
    <div
      className="flex flex-col h-full bg-gray-50 border border-gray-200 rounded-large p-5 small:p-6"
      data-testid="engineering-service-card"
    >
      {media}
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
