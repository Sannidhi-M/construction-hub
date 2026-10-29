"use client"

import { useCarousel } from "@lib/hooks/use-carousel"
import { otherServicesSlides } from "@lib/data/other-services-slides"
import ServiceSlides from "@modules/engineering/components/service-slides"

const DEFAULT_AUTOPLAY_MS = 6500

/**
 * The Other Services slider: two photos per slide, each with its service
 * name over it. Used by the homepage card and the /engineering page; the
 * sentence and quote button beside it don't change per slide, so they live
 * in the caller.
 */
const OtherServicesSlider = ({
  autoplayMs = DEFAULT_AUTOPLAY_MS,
}: {
  // The homepage shows this beside the Engineering Services slider; a
  // different interval keeps the two from flipping in lockstep.
  autoplayMs?: number
}) => {
  const { index, goTo, pauseHandlers, swipeHandlers } = useCarousel({
    count: otherServicesSlides.length,
    autoplayMs,
  })

  return (
    <div className="h-full min-w-0" {...pauseHandlers}>
      <ServiceSlides
        slides={otherServicesSlides}
        eyebrow="Other Services"
        label="Other services"
        index={index}
        onSelect={goTo}
        swipeHandlers={swipeHandlers}
      />
    </div>
  )
}

export default OtherServicesSlider
