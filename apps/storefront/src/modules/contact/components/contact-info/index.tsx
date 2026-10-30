import { ReactNode } from "react"
import { Clock, Envelope, MapPin, Phone } from "@medusajs/icons"
import { Button, Heading, Text } from "@modules/common/components/ui"
import WhatsApp from "@modules/common/icons/whatsapp"
import {
  SITE_ADDRESS,
  SITE_EMAIL,
  SITE_HOURS,
  SITE_LOCATION,
  SITE_PHONE,
  WHATSAPP_URL,
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
  <div className="flex flex-1 items-center gap-x-4 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
      {icon}
    </div>
    <div className="flex flex-col gap-y-1 min-w-0">
      <Text className="font-semibold text-gray-900">{title}</Text>
      {children}
    </div>
  </div>
)

/**
 * The "call / WhatsApp / email / visit us" side of the Contact page, as a card
 * the same height as the message form beside it (the map link lives inside
 * Visit Us). Phone and
 * location are always known; email, full address and opening hours are
 * optional config (lib/constants.tsx) and their cards simply don't render
 * until set, rather than showing made-up details.
 */
const ContactInfo = () => {
  const visitText = SITE_ADDRESS || SITE_LOCATION
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(visitText)}`

  return (
    <div
      className="flex h-full flex-col bg-white border border-gray-200 rounded-lg shadow-sm p-6 small:p-8"
      data-testid="contact-info"
    >
      <Heading level="h2" className="text-2xl font-bold text-gray-900">
        Contact information
      </Heading>
      <Text className="text-ui-fg-subtle mt-1 mb-6">
        Prefer to reach us directly? Here&apos;s how.
      </Text>

      <div className="flex flex-1 flex-col gap-y-3">
        <InfoCard icon={<Phone />} title="Call Us">
          <a
            href={`tel:${SITE_PHONE.replace(/\s+/g, "")}`}
            className="text-gray-700 hover:text-brand-600"
            data-testid="contact-phone-link"
          >
            {SITE_PHONE}
          </a>
        </InfoCard>

        <InfoCard icon={<WhatsApp size={22} />} title="WhatsApp">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-brand-600"
            data-testid="contact-whatsapp-link"
          >
            Chat with us on WhatsApp
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
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 self-start"
          >
            <Button
              variant="outline-brand"
              size="small"
              data-testid="contact-maps-button"
            >
              Open in Google Maps
            </Button>
          </a>
        </InfoCard>

        {SITE_HOURS && (
          <InfoCard icon={<Clock />} title="Business Hours">
            <Text className="text-gray-700">{SITE_HOURS}</Text>
          </InfoCard>
        )}
      </div>
    </div>
  )
}

export default ContactInfo
