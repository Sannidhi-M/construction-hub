import { Metadata } from "next"
import PlatformBanner from "@modules/common/components/platform-banner"
import EngineeringServicesShowcase from "@modules/engineering/components/engineering-services-showcase"
import OtherServicesSlider from "@modules/engineering/components/other-services-slider"
import EngineeringShowcase from "@modules/engineering/components/engineering-showcase"
import SectionHeading from "@modules/home/components/section-heading"
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
        eyebrow="Platform 3"
        title="Engineering Services"
        description="Request a free quote online and our engineers will call you back shortly."
      />
      <div className="w-full bg-white">
        <div className="content-container py-16">
          <SectionHeading title="Engineering Services" />
          <EngineeringServicesShowcase />
        </div>
      </div>
      <EngineeringShowcase
        title="Other Services"
        description={otherServicesPitch}
        ctaHref="/engineering/other-services/quote"
        media={<OtherServicesSlider />}
        backgroundClassName="bg-[#F3F4F6]"
      />
    </>
  )
}
