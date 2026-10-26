/**
 * Slider photos for the "Other Services" offering (homepage card and the
 * /engineering page). The "Engineering Services" slider isn't here — it has
 * real text over artwork, with its own content in
 * engineering-service-slides.ts.
 */

export type EngineeringSlide = {
  src: string
  alt: string
}

/**
 * "Other Services": still placeholder photos from Wikimedia Commons, pending
 * its own real images — see the credit line in the footer (the site plan is
 * CC BY; the other three are CC0/public domain).
 */
export const otherServicesSlides: EngineeringSlide[] = [
  {
    src: "/images/engineering/home-framing.jpg",
    alt: "A construction worker on the timber roof trusses of a house",
  },
  {
    src: "/images/engineering/site-cranes.jpg",
    alt: "A construction site with a tower crane and concrete formwork",
  },
  {
    src: "/images/engineering/building-plans.jpg",
    alt: "A colorful site plan showing the layout of a building complex",
  },
  {
    src: "/images/engineering/architectural-model.jpg",
    alt: "A detailed architectural model of a brick building and plaza",
  },
]
