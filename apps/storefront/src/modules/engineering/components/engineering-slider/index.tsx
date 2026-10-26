"use client"

import Image from "next/image"
import { ChevronLeft, ChevronRight } from "@medusajs/icons"
import { useCarousel } from "@lib/hooks/use-carousel"

export type Slide = {
  src: string
  alt: string
}

const DEFAULT_AUTOPLAY_MS = 5000

/**
 * Horizontal image slider: prev/next arrows, dots, touch swipe, and
 * autoplay that pauses while the pointer or keyboard focus is inside it.
 * Autoplay is skipped entirely when the visitor has asked their OS for
 * reduced motion.
 */
const EngineeringSlider = ({
  slides,
  autoplayMs = DEFAULT_AUTOPLAY_MS,
  aspectClassName = "aspect-[16/9]",
}: {
  slides: Slide[]
  // Two sliders shown side by side can be given different intervals so
  // they don't flip in lockstep.
  autoplayMs?: number
  // Tailwind aspect-ratio class: a wider ratio makes a shorter picture.
  aspectClassName?: string
}) => {
  const count = slides.length
  const { index, goTo, pauseHandlers, swipeHandlers } = useCarousel({
    count,
    autoplayMs,
  })

  return (
    <div
      className={`relative ${aspectClassName} w-full overflow-hidden rounded-large bg-gray-100`}
      role="region"
      aria-roledescription="carousel"
      aria-label="Engineering projects"
      {...pauseHandlers}
      {...swipeHandlers}
      data-testid="engineering-slider"
    >
      <div
        className="flex h-full transition-transform duration-500 ease-out motion-reduce:transition-none"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide, slideIndex) => (
          <div
            key={slide.src}
            className="relative h-full w-full shrink-0"
            role="group"
            aria-roledescription="slide"
            aria-label={`${slideIndex + 1} of ${count}`}
            aria-hidden={slideIndex !== index}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-center"
              draggable={false}
            />
          </div>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous slide"
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
            data-testid="engineering-slider-prev"
          >
            <ChevronLeft />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next slide"
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
            data-testid="engineering-slider-next"
          >
            <ChevronRight />
          </button>

          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-x-2">
            {slides.map((slide, slideIndex) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => goTo(slideIndex)}
                aria-label={`Go to slide ${slideIndex + 1}`}
                aria-current={slideIndex === index}
                className={`h-2 rounded-full shadow transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 ${
                  slideIndex === index
                    ? "w-6 bg-brand-500"
                    : "w-2 bg-white/80 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default EngineeringSlider
