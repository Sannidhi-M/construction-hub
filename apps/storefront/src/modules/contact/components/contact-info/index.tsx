import { ReactNode } from "react"
import { Clock, Envelope, MapPin, Phone } from "@medusajs/icons"
import { Button, Heading, Text } from "@modules/common/components/ui"
import {
  SITE_ADDRESS,
  SITE_EMAIL,
  SITE_HOURS,
  SITE_LOCATION,
  SITE_PHONE,
} from "@lib/constants"

const InfoCard = ({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
}) => (
  <div className="flex items-start gap-x-4 bg-white border border-gray-200 rounded-lg shadow-sm p-5">
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
      {icon}
    </div>
    <div className="flex flex-col gap-y-1 min-w-0">
      <Text className="font-semibold text-gray-900">{title}</Text>
      {children}
    </div>
  </div>
)

/**
 * The "call / email / visit us" side of the Contact page. Phone and
 * location are always known; email, full address and opening hours are
 * optional config (lib/constants.tsx) and their cards simply don't render
 * until set, rather than showing made-up details.
 */
const ContactInfo = () => {
  const visitText = SITE_ADDRESS || SITE_LOCATION
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(visitText)}`

  return (
    <div className="flex flex-col gap-y-4" data-testid="contact-info">
      <Heading level="h2" className="text-2xl font-bold text-gray-900 mb-1">
        Contact information
      </Heading>

      <InfoCard icon={<Phone />} title="Call Us">
        <a
          href={`tel:${SITE_PHONE.replace(/\s+/g, "")}`}
          className="text-gray-700 hover:text-brand-600"
          data-testid="contact-phone-link"
        >
          {SITE_PHONE}
        </a>
      </InfoCard>

      {SITE_EMAIL && (
        <InfoCard icon={<Envelope />} title="Email Us">
          <a
            href={`mailto:${SITE_EMAIL}`}
            className="text-gray-700 hover:text-brand-600 break-all"
            data-testid="contact-email-link"
          >
            {SITE_EMAIL}
          </a>
        </InfoCard>
      )}

      <InfoCard icon={<MapPin />} title="Visit Us">
        <Text className="text-gray-700">{visitText}</Text>
      </InfoCard>

      {SITE_HOURS && (
        <InfoCard icon={<Clock />} title="Business Hours">
          <Text className="text-gray-700">{SITE_HOURS}</Text>
        </InfoCard>
      )}

      <div className="flex flex-col items-center text-center gap-y-3 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <MapPin className="text-gray-400" />
        <Text className="font-medium text-gray-900">{visitText}</Text>
        <a href={mapsUrl} target="_blank" rel="noreferrer">
          <Button variant="outline-brand" data-testid="contact-maps-button">
            Open in Google Maps
          </Button>
        </a>
      </div>
    </div>
  )
}

export default ContactInfo
