/**
 * Placeholder photos for the Engineering Services sliders (homepage and the
 * /engineering page), from Wikimedia Commons, pending real project
 * photography — see the credit line in the footer (the site plan is CC BY;
 * the other three are CC0/public domain).
 */

export type EngineeringSlide = {
  src: string
  alt: string
}

export const engineeringSlides: EngineeringSlide[] = [
  {
    src: "/images/engineering/building-plans.jpg",
    alt: "A colorful site plan showing the layout of a building complex",
  },
  {
    src: "/images/engineering/architectural-model.jpg",
    alt: "A detailed architectural model of a brick building and plaza",
  },
  {
    src: "/images/engineering/home-framing.jpg",
    alt: "A construction worker on the timber roof trusses of a house",
  },
  {
    src: "/images/engineering/site-cranes.jpg",
    alt: "A construction site with a tower crane and concrete formwork",
  },
]
