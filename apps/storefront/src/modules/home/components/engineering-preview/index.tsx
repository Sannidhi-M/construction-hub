import EngineeringShowcase from "@modules/engineering/components/engineering-showcase"
import { engineeringSlides } from "@lib/data/engineering-slides"

// Straight to the quote form — the /engineering page is for browsing the
// services, this is the shortcut for someone who already wants a quote.
const EngineeringPreview = () => {
  return (
    <EngineeringShowcase
      eyebrow="Platform 3"
      title="Engineering Services"
      description="From architectural drawings to complete home construction — our engineers handle every stage of your project in Davangere."
      ctaHref="/engineering/quote"
      slides={engineeringSlides}
    />
  )
}

export default EngineeringPreview
