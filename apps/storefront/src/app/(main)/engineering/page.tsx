import { Metadata } from "next"
import EngineeringShowcase from "@modules/engineering/components/engineering-showcase"
import { engineeringSlides } from "@lib/data/engineering-slides"
import { SITE_NAME } from "@lib/constants"

export const metadata: Metadata = {
  title: `Engineering Services | ${SITE_NAME}`,
  description:
    "From architectural drawings to complete home construction — our engineers handle every stage of your project in Davangere.",
}

// The same placeholder photos as the first section, started from a
// different one so the two sliders don't open on the identical picture.
const otherServicesSlides = [
  ...engineeringSlides.slice(2),
  ...engineeringSlides.slice(0, 2),
]

export default function EngineeringPage() {
  return (
    <>
      <EngineeringShowcase
        title="Engineering Services"
        description="From architectural drawings to complete home construction — our engineers handle every stage of your project in Davangere."
        ctaHref="/engineering/quote"
        slides={engineeringSlides}
      />
      <EngineeringShowcase
        title="Other Services"
        description="Precast compound walls, steel fabrication, gates and grills, aluminium and UPVC works, glazing, waterproofing and roofing — get a free quote for the work your project needs."
        ctaHref="/engineering/other-services/quote"
        slides={otherServicesSlides}
        backgroundClassName="bg-[#F3F4F6]"
      />
    </>
  )
}
