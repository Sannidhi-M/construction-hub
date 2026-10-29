"use client"

import { useCarousel } from "@lib/hooks/use-carousel"
import { engineeringServiceSlides } from "@lib/data/engineering-service-slides"
import ServiceSlides from "@modules/engineering/components/service-slides"

const DEFAULT_AUTOPLAY_MS = 7000

/**
 * The Engineering Services slider on its own (no detail panel) — for places
 * that are only half a page wide, like the homepage card. The full
 * slider-plus-details layout is EngineeringServicesShowcase.
 */
const EngineeringServicesSlider = ({
  autoplayMs = DEFAULT_AUTOPLAY_MS,
}: {
  // Two sliders shown side by side can be given different intervals so they
  // don't flip in lockstep.
  autoplayMs?: number
}) => {
  const { index, goTo, pauseHandlers, swipeHandlers } = useCarousel({
    count: engineeringServiceSlides.length,
    autoplayMs,
  })

  return (
    // Pause-on-hover/focus covers the whole slider, dots included.
    <div className="h-full min-w-0" {...pauseHandlers}>
      <ServiceSlides
        eyebrow="Engineering Services"
        slides={engineeringServiceSlides}
        index={index}
        onSelect={goTo}
        swipeHandlers={swipeHandlers}
      />
    </div>
  )
}

export default EngineeringServicesSlider
