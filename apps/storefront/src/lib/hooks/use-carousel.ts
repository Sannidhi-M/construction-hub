import { TouchEvent, useCallback, useEffect, useRef, useState } from "react"

// Minimum horizontal travel (px) for a touch drag to count as a swipe,
// so a slightly shaky tap on a slide doesn't change it.
const SWIPE_THRESHOLD_PX = 40

/**
 * The behaviour shared by the site's sliders: which slide is showing,
 * autoplay, pausing while the pointer or keyboard focus is inside, and touch
 * swipe. Autoplay is skipped entirely when the visitor has asked their OS for
 * reduced motion.
 *
 * It returns spreadable handlers rather than rendering anything, so a slider
 * decides where they go — e.g. the Engineering Services showcase attaches
 * `pauseHandlers` to the whole section (so hovering the detail text also
 * stops the slides moving under the reader) and `swipeHandlers` to the
 * slide area only.
 */
export function useCarousel({
  count,
  autoplayMs,
}: {
  count: number
  autoplayMs: number
}) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const touchStartX = useRef<number | null>(null)

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
    const timer = setTimeout(() => goTo(index + 1), autoplayMs)
    return () => clearTimeout(timer)
  }, [index, paused, reducedMotion, count, goTo, autoplayMs])

  const pauseHandlers = {
    onMouseEnter: () => setPaused(true),
    onMouseLeave: () => setPaused(false),
    onFocus: () => setPaused(true),
    onBlur: () => setPaused(false),
  }

  const swipeHandlers = {
    onTouchStart: (event: TouchEvent) => {
      touchStartX.current = event.touches[0].clientX
    },
    onTouchEnd: (event: TouchEvent) => {
      if (touchStartX.current === null) {
        return
      }
      const deltaX = event.changedTouches[0].clientX - touchStartX.current
      touchStartX.current = null
      if (Math.abs(deltaX) >= SWIPE_THRESHOLD_PX) {
        goTo(index + (deltaX < 0 ? 1 : -1))
      }
    },
  }

  return { index, goTo, pauseHandlers, swipeHandlers }
}
