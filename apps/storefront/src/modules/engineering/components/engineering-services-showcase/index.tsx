"use client"

import { ChevronRight } from "@medusajs/icons"
import { Button } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useCarousel } from "@lib/hooks/use-carousel"
import { engineeringServiceSlides } from "@lib/data/engineering-service-slides"
import ServiceSlides from "@modules/engineering/components/service-slides"
import ServiceDetails from "@modules/engineering/components/service-details"

// Longer than a picture-only slider: there's text to read beside it.
const AUTOPLAY_MS = 8000

/**
 * The full Engineering Services layout for the /engineering page: the slider
 * on the left, and on the right the details of the two services on the
 * current slide (which follow it), then the quote button.
 *
 * Pausing is attached to the whole block, so a visitor reading the text on
 * the right isn't pulled to the next slide mid-sentence.
 */
const EngineeringServicesShowcase = () => {
  const { index, goTo, pauseHandlers, swipeHandlers } = useCarousel({
    count: engineeringServiceSlides.length,
    autoplayMs: AUTOPLAY_MS,
  })

  return (
    <div
      className="grid grid-cols-1 medium:grid-cols-2 gap-8 medium:gap-12 items-start"
      {...pauseHandlers}
      data-testid="engineering-services-showcase"
    >
      <ServiceSlides
        eyebrow="Engineering Services"
        slides={engineeringServiceSlides}
        index={index}
        onSelect={goTo}
        swipeHandlers={swipeHandlers}
      />

      <div>
        <ServiceDetails slides={engineeringServiceSlides} index={index} />
        <LocalizedClientLink href="/engineering/quote" className="mt-8 inline-block">
          <Button variant="primary" size="large">
            Get a Free Quote
            <ChevronRight />
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default EngineeringServicesShowcase
