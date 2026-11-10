import { Gift } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Heading, Text } from "@modules/common/components/ui"
import { FREE_CLAIM_HREF, freeServices } from "@lib/data/free-service"

/**
 * The welcome-offer band: one free engineering service per customer. A
 * server component with no state, so it can sit on cached pages. It is shown
 * to everyone: a customer who has already claimed finds that out when they
 * click through (see FreeClaimedCard), rather than the offer vanishing.
 */
const FreeServiceBanner = () => {
  return (
    <section
      className="relative w-full overflow-hidden border-y border-brand-200 bg-gradient-to-r from-brand-100 via-brand-50 to-brand-100 text-gray-900"
      aria-label="Free engineering service offer"
      data-testid="free-service-banner"
    >
      {/* A slow light streak across the band — motion to catch the eye. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-transparent via-white/70 to-transparent animate-sheen motion-reduce:hidden"
      />
      <div className="content-container relative py-10 small:py-12">
        <div className="flex flex-col medium:flex-row medium:items-center gap-8 medium:gap-12">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-x-3">
              <span className="relative flex h-11 w-11 shrink-0">
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-brand-400 opacity-60 animate-ping motion-reduce:hidden"
                />
                <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 text-white shadow">
                  <Gift className="w-6 h-6" />
                </span>
              </span>
              <Text className="text-sm font-bold uppercase tracking-widest text-brand-600">
                Welcome offer
              </Text>
            </div>
            <Heading
              level="h2"
              className="mt-4 text-3xl small:text-4xl font-extrabold leading-tight"
            >
              Your first engineering service is <span className="bg-gradient-to-r from-brand-600 to-amber-500 bg-clip-text text-transparent">FREE</span>
            </Heading>
            <Text className="mt-2 text-base small:text-lg text-gray-600 max-w-xl">
              Choose any one of these, on us. One free service per customer.
            </Text>
            <ul className="mt-5 flex flex-wrap gap-2">
              {freeServices.map((service) => (
                <li
                  key={service.slug}
                  className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-gray-800 border border-brand-200 shadow-sm"
                >
                  {service.name}
                </li>
              ))}
            </ul>
          </div>

          {/* The glow animates this wrapper, not the link: the link's own
              `transition` utilities would otherwise override the animation's
              timing (same trap as the WhatsApp button). */}
          <span className="inline-flex shrink-0 self-start medium:self-center rounded-rounded animate-cta-glow motion-reduce:animate-none">
            <LocalizedClientLink
              href={FREE_CLAIM_HREF}
              className="relative inline-flex items-center justify-center overflow-hidden rounded-rounded bg-brand-500 px-8 py-4 text-base font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 motion-reduce:transition-none motion-reduce:hover:scale-100"
              data-testid="free-service-cta"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-sheen-btn motion-reduce:hidden"
              />
              <span className="relative">Claim your free service</span>
            </LocalizedClientLink>
          </span>
        </div>
      </div>
    </section>
  )
}

export default FreeServiceBanner
