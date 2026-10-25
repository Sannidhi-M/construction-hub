"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "@medusajs/icons"

export type Slide = {
  src: string
  alt: string
}

const AUTOPLAY_MS = 5000
// Minimum horizontal travel (px) for a touch drag to count as a swipe,
// so a slightly shaky tap on a slide doesn't change it.
const SWIPE_THRESHOLD_PX = 40

/**
 * Horizontal image slider: prev/next arrows, dots, touch swipe, and
 * autoplay that pauses while the pointer or keyboard focus is inside it.
 * Autoplay is skipped entirely when the visitor has asked their OS for
 * reduced motion.
 */
const EngineeringSlider = ({ slides }: { slides: Slide[] }) => {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const count = slides.length
  const goTo = useCallback(
    (next: number) => setIndex(((next % count) + count) % count),
    [count]
  )

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReducedMotion(query.matches)
    const onChange = (event: MediaQueryListEvent) =>
      setReducedMotion(event.matches)
    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [])

  useEffect(() => {
    if (paused || reducedMotion || count < 2) {
      return
    }
    // Keyed on `index`, so every manual change (arrow, dot, swipe) also
    // restarts the countdown instead of the next auto-advance landing a
    // fraction of a second later.
    const timer = setTimeout(() => goTo(index + 1), AUTOPLAY_MS)
    return () => clearTimeout(timer)
  }, [index, paused, reducedMotion, count, goTo])

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null) {
      return
    }
    const deltaX = event.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(deltaX) >= SWIPE_THRESHOLD_PX) {
      goTo(index + (deltaX < 0 ? 1 : -1))
    }
  }

  return (
    <div
      className="relative aspect-[16/9] w-full overflow-hidden rounded-large bg-gray-100"
      role="region"
      aria-roledescription="carousel"
      aria-label="Engineering projects"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0].clientX
      }}
      onTouchEnd={handleTouchEnd}
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
