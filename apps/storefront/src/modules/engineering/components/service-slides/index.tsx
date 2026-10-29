"use client"

import Image from "next/image"
import { ChevronLeft, ChevronRight } from "@medusajs/icons"
import { Heading, Text } from "@modules/common/components/ui"

// What a slide needs to be drawn. Structural, so both the Engineering Services
// slides (with a headline and tagline per slide) and the Other Services
// slides (pictures and names only) fit.
export type SlideView = {
  headline?: string
  tagline?: string
  services: { number: string; name: string; image: string; imageAlt: string }[]
}

/**
 * The slider itself — purely presentational: which slide shows, and what to
 * do on a click or swipe, come from the caller (via `useCarousel`), so the
 * same view serves both the homepage card and the /engineering showcase,
 * where the detail panel must follow the same slide.
 *
 * Each slide is the artwork with a headline and the two service names laid
 * over it as REAL text, so they scale with the screen rather than shrinking
 * with a picture.
 */
const ServiceSlides = ({
  slides,
  index,
  onSelect,
  swipeHandlers,
  eyebrow,
  label = "Engineering services",
}: {
  slides: SlideView[]
  // Small caps line above each slide's headline; unused without headlines.
  eyebrow?: string
  // Accessible name of the carousel region.
  label?: string
  index: number
  onSelect: (index: number) => void
  swipeHandlers: Pick<React.HTMLAttributes<HTMLDivElement>, "onTouchStart" | "onTouchEnd">
}) => {
  const count = slides.length

  return (
    <div className="flex h-full flex-col" data-testid="engineering-services-slider">
      <div
        className="relative flex flex-1 flex-col overflow-hidden rounded-large border border-gray-200 bg-gradient-to-br from-brand-50 via-white to-brand-50"
        role="region"
        aria-roledescription="carousel"
        aria-label={label}
        {...swipeHandlers}
      >
        <div
          className="flex flex-1 transition-transform duration-500 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {slides.map((slide, slideIndex) => (
            <div
              key={slideIndex}
              className="flex w-full shrink-0 flex-col p-4 small:p-6"
              role="group"
              aria-roledescription="slide"
              aria-label={`${slideIndex + 1} of ${count}`}
              aria-hidden={slideIndex !== index}
            >
              {slide.headline && (
                <div className="mb-4">
                  {eyebrow && (
                    <Text className="text-xs font-semibold uppercase tracking-widest text-brand-600">
                      {eyebrow}
                    </Text>
                  )}
                  <Heading
                    level="h3"
                    className="mt-1 text-2xl small:text-3xl font-extrabold leading-tight text-gray-900"
                  >
                    {slide.headline}
                  </Heading>
                  <Text className="mt-1 text-sm text-gray-500">{slide.tagline}</Text>
                </div>
              )}

              <div className="grid flex-1 grid-cols-2 gap-3">
                {slide.services.map((service) => (
                  <div
                    key={service.number}
                    className="relative aspect-[4/5] self-stretch overflow-hidden rounded-lg"
                  >
                    <Image
                      src={service.image}
                      alt={service.imageAlt}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover object-center"
                      draggable={false}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent px-3 pb-3 pt-12">
                      <span className="text-xs font-bold text-brand-300">
                        {service.number}
                      </span>
                      <p className="text-sm small:text-base font-semibold leading-snug text-white">
                        {service.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onSelect(index - 1)}
          aria-label="Previous slide"
          className="absolute left-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          data-testid="engineering-services-prev"
        >
          <ChevronLeft />
        </button>
        <button
          type="button"
          onClick={() => onSelect(index + 1)}
          aria-label="Next slide"
          className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-900 shadow transition-colors hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
          data-testid="engineering-services-next"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Dots sit BELOW the slider (not over the picture), so they never
          cover a caption. */}
      <div className="mt-4 flex items-center justify-center gap-x-2">
        {slides.map((slide, slideIndex) => (
          <button
            key={slideIndex}
            type="button"
            onClick={() => onSelect(slideIndex)}
            aria-label={`Go to slide ${slideIndex + 1}`}
            aria-current={slideIndex === index}
            className={`h-2 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500 ${
              slideIndex === index
                ? "w-6 bg-brand-500"
                : "w-2 bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

export default ServiceSlides
