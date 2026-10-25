import { Metadata } from "next"
import PlatformBanner from "@modules/common/components/platform-banner"
import EngineeringShowcase from "@modules/engineering/components/engineering-showcase"
import { engineeringSlides, otherServicesSlides } from "@lib/data/engineering-slides"
import { engineeringPitch, otherServicesPitch } from "@lib/data/engineering-copy"
import { SITE_NAME } from "@lib/constants"

export const metadata: Metadata = {
  title: `Engineering Services | ${SITE_NAME}`,
  description: engineeringPitch,
}

export default function EngineeringPage() {
  return (
    <>
      <PlatformBanner
        platform="Platform 3"
        title="Engineering Services"
        description="Request a free quote online and our engineers will call you back shortly."
      />
      <EngineeringShowcase
        title="Engineering Services"
        description={engineeringPitch}
        ctaHref="/engineering/quote"
        slides={engineeringSlides}
      />
      <EngineeringShowcase
        title="Other Services"
        description={otherServicesPitch}
        ctaHref="/engineering/other-services/quote"
        slides={otherServicesSlides}
        backgroundClassName="bg-[#F3F4F6]"
      />
    </>
  )
}
