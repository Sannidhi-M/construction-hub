/**
 * Content for the Engineering Services slider and its detail panel: four
 * slides, each covering two of the eight services (the grouping from the
 * designed banners the business supplied, whose wording this is).
 *
 * Everything here is rendered as real page text over the artwork — not baked
 * into an image — so it stays sharp and readable at any screen width (the
 * baked-in version shrank to ~5px paragraphs on the homepage card).
 *
 * The images are illustrations cropped from those banners, web-sized.
 *
 * Service NAMES are not written here: each entry names its picklist `slug`
 * and the name is looked up from engineering-services.ts, the same list the
 * quote form's dropdown uses. That's deliberate — the slider and the form had
 * drifted apart on two names when each carried its own copy, and a typo'd or
 * renamed slug now fails the build instead of showing a different name.
 */

import { engineeringServices } from "./engineering-services"

export type ServiceItem = {
  number: string
  slug: string
  name: string
  tagline: string
  description: string
  bullets: string[]
  image: string
  imageAlt: string
}

export type ServiceSlide = {
  headline: string
  tagline: string
  services: [ServiceItem, ServiceItem]
}

// What is written by hand below: everything about a service except its name.
type ServiceContent = Omit<ServiceItem, "name">
type SlideContent = Omit<ServiceSlide, "services"> & {
  services: [ServiceContent, ServiceContent]
}

const nameOf = (slug: string) => {
  const service = engineeringServices.find((item) => item.slug === slug)
  if (!service) {
    throw new Error(
      `engineering-service-slides.ts: "${slug}" is not in the quote form's service list (engineering-services.ts)`
    )
  }
  return service.name
}

const withName = (content: ServiceContent): ServiceItem => ({
  ...content,
  name: nameOf(content.slug),
})

const slideContent: SlideContent[] = [
  {
    headline: "Design Your Vision",
    tagline: "Thoughtful designs for spaces that inspire",
    services: [
      {
        number: "01",

        slug: "architectural-floor-plans",
        tagline: "Custom plans for better living",
        description:
          "Get customised 2D/3D floor plans as per your needs, optimized for space, functionality, ventilation and aesthetics. We consider your lifestyle, plot size, budget and Vastu requirements to create practical and beautiful designs.",
        bullets: [
          "Residential & Commercial",
          "Vastu Compliant Designs",
          "Approved Ready Drawings",
        ],
        image: "/images/engineering/services/floor-plans.jpg",
        imageAlt: "A 3D floor plan laid out on architectural drawings",
      },
      {
        number: "02",

        slug: "3d-elevations-visualization",
        tagline: "See your dream before it's built",
        description:
          "Realistic 3D elevations and visualizations to help you see your project before construction begins. We create modern, traditional or contemporary designs with accurate details, materials and colours so you can make better decisions with confidence.",
        bullets: [
          "Modern & Traditional Styles",
          "Day & Night Views",
          "Custom Finishes & Materials",
        ],
        image: "/images/engineering/services/3d-elevation.jpg",
        imageAlt: "A 3D render of a modern two-storey house at dusk",
      },
    ],
  },
  {
    headline: "Strong Structures. Smarter Spaces.",
    tagline: "Safe • Functional • Cost-effective • Future ready",
    services: [
      {
        number: "03",

        slug: "structural-design-drawings",
        tagline: "Safe. Durable. Code compliant.",
        description:
          "Get safe, durable and cost-effective structural designs by qualified engineers, following IS codes and local regulations. We provide detailed drawings for foundations, columns, beams, slabs and other structural elements.",
        bullets: [
          "RCC & Steel Structures",
          "Detailed Structural Drawings",
          "Safe & Optimized Design",
        ],
        image: "/images/engineering/services/structural.jpg",
        imageAlt: "A reinforced concrete building frame with scaffolding",
      },
      {
        number: "04",

        slug: "interior-design-space-planning",
        tagline: "Beautiful spaces. Thoughtfully planned.",
        description:
          "Create interiors that match your style, needs and budget. We plan spaces for better functionality, lighting, storage and aesthetics, making every area comfortable and efficient.",
        bullets: [
          "Space Optimization",
          "Modern & Traditional Themes",
          "Complete Interior Execution",
        ],
        image: "/images/engineering/services/interior.jpg",
        imageAlt: "A bright, elegantly furnished living room",
      },
    ],
  },
  {
    headline: "Plan Smart. Spend Smart.",
    tagline: "Accurate estimates • Optimised resources • Better decisions",
    services: [
      {
        number: "05",

        slug: "boq-quantity-estimation",
        tagline: "Know exactly what you need",
        description:
          "We prepare a detailed Bill of Quantities (BOQ) with accurate material and work quantities so you can plan your project with clarity, avoid wastage and keep your construction on track.",
        bullets: [
          "Detailed Quantity Take-Off",
          "Material & Labour Breakdown",
          "Suitable for Residential & Commercial Projects",
        ],
        image: "/images/engineering/services/boq.jpg",
        imageAlt: "A bill of quantities sheet with a calculator and a measuring tape",
      },
      {
        number: "06",

        slug: "cost-estimation",
        tagline: "Plan your budget with confidence",
        description:
          "We provide detailed cost estimates covering materials, labour and other project expenses, helping you plan your finances effectively and make informed decisions before construction begins.",
        bullets: [
          "Material, Labour & Other Costs",
          "Stage-wise Cost Estimation",
          "Budget Planning & Cost Optimization",
        ],
        image: "/images/engineering/services/cost-estimate.jpg",
        imageAlt: "A cost estimate sheet beside a model house and a stack of coins",
      },
    ],
  },
  {
    headline: "From Vision to Reality.",
    tagline: "Plan • Build • Renovate • Add value • Complete solutions",
    services: [
      {
        number: "07",

        slug: "property-valuation-assessment",
        tagline: "Know the true value. Make better decisions.",
        description:
          "We provide professional property valuation and assessment to help you understand the current market value, physical condition and development potential of your property. Useful for buying, selling, renovation planning, loans and investment decisions.",
        bullets: [
          "Accurate Market Valuation",
          "Detailed Property Assessment",
          "Support for Buying, Selling & Investment Planning",
        ],
        image: "/images/engineering/services/valuation.jpg",
        imageAlt: "A property valuation checklist on a clipboard with a model house",
      },
      {
        number: "08",

        slug: "turnkey-construction",
        tagline: "From foundation to finishing",
        description:
          "We undertake complete turnkey construction, managing your project from design to handover. We also handle renovation, extensions and remodelling to transform existing spaces with better functionality, modern finishes and long-lasting quality.",
        bullets: [
          "End-to-End Project Management",
          "New Construction & Turnkey Solutions",
          "Renovation, Extension & Remodeling",
        ],
        image: "/images/engineering/services/turnkey.jpg",
        imageAlt: "A finished contemporary house with warm evening lighting",
      },
    ],
  },
]

export const engineeringServiceSlides: ServiceSlide[] = slideContent.map(
  (slide) => ({
    ...slide,
    services: [withName(slide.services[0]), withName(slide.services[1])],
  })
)
