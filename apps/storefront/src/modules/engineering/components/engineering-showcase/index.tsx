import { ChevronRight } from "@medusajs/icons"
import { Button, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import SectionHeading from "@modules/home/components/section-heading"
import EngineeringSlider from "@modules/engineering/components/engineering-slider"
import { EngineeringSlide } from "@lib/data/engineering-slides"

type EngineeringShowcaseProps = {
  eyebrow?: string
  title: string
  description: string
  ctaHref: string
  ctaLabel?: string
  slides: EngineeringSlide[]
  // Full-width background of the section, so stacked sections can
  // alternate (the homepage alternates white and light grey).
  backgroundClassName?: string
}

/**
 * A platform section: heading on top, then an image slider on the left and
 * a short pitch plus a call-to-action on the right. Used on the homepage and
 * (twice, for "Engineering Services" and "Other Services") on /engineering.
 */
const EngineeringShowcase = ({
  eyebrow,
  title,
  description,
  ctaHref,
  ctaLabel = "Get a Free Quote",
  slides,
  backgroundClassName = "bg-white",
}: EngineeringShowcaseProps) => {
  return (
    <div className={`w-full ${backgroundClassName}`}>
      <div className="content-container py-16">
        <SectionHeading eyebrow={eyebrow} title={title} />
        <div className="grid grid-cols-1 medium:grid-cols-2 gap-8 medium:gap-12 items-center">
          <EngineeringSlider slides={slides} />

          <div>
            <Text className="text-lg text-gray-500 max-w-xl">{description}</Text>
            <LocalizedClientLink href={ctaHref} className="inline-block mt-6">
              <Button variant="primary" size="large">
                {ctaLabel}
                <ChevronRight />
              </Button>
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EngineeringShowcase
