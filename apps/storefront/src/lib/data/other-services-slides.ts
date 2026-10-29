/**
 * The "Other Services" slider: four slides of two photos each, in the order
 * of the quote form's picklist. Each slide has a headline and tagline over
 * its two photos (as the Engineering Services slides do, which also keeps
 * the two homepage sliders the same height); the one sentence and the quote
 * button that go with the slider are fixed (see otherServicesPitch in
 * engineering-copy.ts), not per slide.
 *
 * As with the Engineering Services slides, names are NOT written here: each
 * entry names its picklist `slug` and the name is looked up from
 * engineering-services.ts, so the slider and the quote form's dropdown can't
 * drift apart (an unknown slug fails the build). The photos are portrait
 * 900x1200 with calm lower thirds, because the name is laid over that part.
 */

import { otherServices } from "./engineering-services"
import type { SlideView } from "@modules/engineering/components/service-slides"

const IMAGE_DIR = "/images/engineering/other-services"

const content: { slug: string; image: string; imageAlt: string }[] = [
  {
    slug: "precast-compound-walls",
    image: `${IMAGE_DIR}/1.jpg`,
    imageAlt: "A long grey precast concrete compound wall at sunset, with landscaping along its base",
  },
  {
    slug: "steel-fabrication",
    image: `${IMAGE_DIR}/2.jpg`,
    imageAlt: "A steel-framed building under construction, with steel sections stacked beside it",
  },
  {
    slug: "ms-steel-gates-grills",
    image: `${IMAGE_DIR}/3.jpg`,
    imageAlt: "A black steel entrance gate with a geometric grill pattern on a modern home",
  },
  {
    slug: "upvc-aluminium-doors-windows",
    image: `${IMAGE_DIR}/4.jpg`,
    imageAlt: "A bright living room with large sliding glass doors opening to a garden",
  },
  {
    slug: "glass-glazing-works",
    image: `${IMAGE_DIR}/5.jpg`,
    imageAlt: "A modern building facade of large glass panels, lit by the setting sun",
  },
  {
    slug: "waterproofing",
    image: `${IMAGE_DIR}/6.jpg`,
    imageAlt: "A worker rolling a waterproofing coating onto a terrace slab",
  },
  {
    slug: "roofing-works",
    image: `${IMAGE_DIR}/7.jpg`,
    imageAlt: "A new house with a metal-sheet and clay-tile roof",
  },
  {
    slug: "solar-water-heaters",
    image: `${IMAGE_DIR}/8.jpg`,
    imageAlt: "A solar water heater with its panels and tank on a rooftop",
  },
]

if (content.length !== otherServices.length) {
  throw new Error(
    `other-services-slides.ts: ${content.length} photos but ${otherServices.length} services in engineering-services.ts — every service needs exactly one photo`
  )
}

const items = content.map((entry, position) => {
  const service = otherServices.find((item) => item.slug === entry.slug)
  if (!service) {
    throw new Error(
      `other-services-slides.ts: "${entry.slug}" is not in the Other Services picklist (engineering-services.ts)`
    )
  }
  return {
    number: String(position + 1).padStart(2, "0"),
    name: service.name,
    image: entry.image,
    imageAlt: entry.imageAlt,
  }
})

// One per slide, in order — each describes the two services on that slide.
const headings = [
  { headline: "Built to Last.", tagline: "Durable • Strong • Made for your project" },
  { headline: "Secure. Stylish. Seamless.", tagline: "Gates • Grills • Doors • Windows • Partitions" },
  { headline: "Clear Views. Dry Spaces.", tagline: "Glass & glazing • Waterproofing • Low maintenance" },
  { headline: "Cover Smart. Power Smart.", tagline: "Roofing • Solar water heaters • Efficient & reliable" },
]

if (headings.length * 2 !== items.length) {
  throw new Error(
    `other-services-slides.ts: ${headings.length} headings for ${items.length} services — each slide shows two services`
  )
}

export const otherServicesSlides: SlideView[] = headings.map(
  (heading, slide) => ({
    ...heading,
    services: items.slice(slide * 2, slide * 2 + 2),
  })
)
