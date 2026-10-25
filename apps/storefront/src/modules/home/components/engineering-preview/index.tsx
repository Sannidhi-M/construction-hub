import EngineeringServiceCard from "@modules/engineering/components/engineering-service-card"
import SectionHeading from "@modules/home/components/section-heading"
import { engineeringSlides, otherServicesSlides } from "@lib/data/engineering-slides"
import { engineeringPitch, otherServicesPitch } from "@lib/data/engineering-copy"

// Each button goes straight to its own quote form — the /engineering page
// is for browsing the services, this is the shortcut for someone who
// already wants a quote.
const EngineeringPreview = () => {
  return (
    <div className="w-full bg-white">
      <div className="content-container py-16">
        <SectionHeading eyebrow="Platform 3" title="Engineering Services" />
        <div className="grid grid-cols-1 medium:grid-cols-2 gap-10 medium:gap-12">
          <EngineeringServiceCard
            title="Engineering Services"
            description={engineeringPitch}
            ctaHref="/engineering/quote"
            slides={engineeringSlides}
          />
          <EngineeringServiceCard
            title="Other Services"
            description={otherServicesPitch}
            ctaHref="/engineering/other-services/quote"
            slides={otherServicesSlides}
            // Slightly different interval, so the two sliders don't flip
            // in lockstep.
            autoplayMs={6500}
          />
        </div>
      </div>
    </div>
  )
}

export default EngineeringPreview
