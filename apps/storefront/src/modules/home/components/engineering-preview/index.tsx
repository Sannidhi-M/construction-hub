import EngineeringServiceCard from "@modules/engineering/components/engineering-service-card"
import EngineeringServicesSlider from "@modules/engineering/components/engineering-services-slider"
import OtherServicesSlider from "@modules/engineering/components/other-services-slider"
import SectionHeading from "@modules/home/components/section-heading"
import { engineeringPitch, otherServicesPitch } from "@lib/data/engineering-copy"

// Each button goes straight to its own quote form — the /engineering page
// is for browsing the services, this is the shortcut for someone who
// already wants a quote.
const EngineeringPreview = () => {
  return (
    <div className="w-full bg-white">
      <div className="content-container py-16">
        <SectionHeading eyebrow="Platform 3" title="Engineering Services" />
        <div className="grid grid-cols-1 medium:grid-cols-2 gap-10 medium:gap-x-12 medium:gap-y-0">
          <EngineeringServiceCard
            title="Engineering Services"
            description={engineeringPitch}
            ctaHref="/engineering/quote"
            // The slider only — the card is half a page wide, so the detail
            // panel that sits beside it on /engineering has no room here.
            media={<EngineeringServicesSlider />}
          />
          <EngineeringServiceCard
            title="Other Services"
            description={otherServicesPitch}
            ctaHref="/engineering/other-services/quote"
            // A slightly different interval from the Engineering slider, so
            // the two don't flip in lockstep.
            media={<OtherServicesSlider autoplayMs={8500} />}
          />
        </div>
      </div>
    </div>
  )
}

export default EngineeringPreview
