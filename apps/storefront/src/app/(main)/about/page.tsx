import { Metadata } from "next"
import { ReactNode } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PlatformBanner from "@modules/common/components/platform-banner"
import { Button, Heading, Text } from "@modules/common/components/ui"
import { SITE_LOCATION, SITE_NAME } from "@lib/constants"

export const metadata: Metadata = {
  title: `About Us | ${SITE_NAME}`,
  description: `${SITE_NAME} is ${SITE_LOCATION}'s one-stop platform for construction materials, skilled labour and engineering services.`,
}

const FOUNDED_YEAR = 2026

const platforms = [
  {
    eyebrow: "Platform 1",
    title: "Construction Materials",
    text: "Cement, steel, sand, aggregates, bricks and blocks, ordered online at clearly shown rates and delivered to your site. Where stock is available, delivery is usually the same day.",
    href: "/store",
    cta: "Shop materials",
  },
  {
    eyebrow: "Platform 2",
    title: "Labour & Manpower",
    text: "Book masons, plumbers, electricians, painters, carpenters and general labour by the hour or by the day, for the dates you need.",
    href: "/labour",
    cta: "Book labour",
  },
  {
    eyebrow: "Platform 3",
    title: "Engineering Services",
    text: "Floor plans, 3D elevations, structural drawings, BOQ and cost estimates, valuation, and turnkey construction — plus compound walls, steel work, gates, doors and windows, glazing, waterproofing, roofing and solar heaters.",
    href: "/engineering",
    cta: "Get a quote",
  },
]

const steps = [
  {
    title: "Tell us what you need",
    text: "Order materials, book workers, or send a quote request, all from one account.",
  },
  {
    title: "We confirm with you",
    text: "Our team calls or messages to confirm the details, dates and price before anything starts.",
  },
  {
    title: "Pay your way",
    text: "Pay by UPI, or choose Cash on Delivery where it's available for materials.",
  },
  {
    title: "We deliver and follow up",
    text: "Track your order, booking or quote from your account, and reach us any time if something isn't right.",
  },
]

const values = [
  {
    title: "One place for the whole job",
    text: "Instead of calling a supplier, a contractor and an engineer separately, you deal with one local team.",
  },
  {
    title: "Clear, honest pricing",
    text: "Rates are shown upfront, and GST is shown separately on your invoice. Changes to a job are agreed with you first.",
  },
  {
    title: "The brand you ordered",
    text: "We supply the brand you picked, and we don't swap it for another without asking you.",
  },
  {
    title: "Local and reachable",
    text: `We are based in ${SITE_LOCATION}. Call, message us on WhatsApp, or write to us and a real person responds.`,
  },
]

const Card = ({ children }: { children: ReactNode }) => (
  <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 small:p-8">
    {children}
  </div>
)

export default function AboutPage() {
  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      <PlatformBanner
        eyebrow="About"
        title={`About ${SITE_NAME}`}
        description={`${SITE_LOCATION}'s one-stop platform for construction materials, skilled labour and engineering services.`}
      />

      <div className="content-container py-10 flex flex-col gap-y-8">
        <Card>
          <Heading level="h2" className="text-2xl font-bold text-gray-900 mb-3">
            Who we are
          </Heading>
          <div className="flex flex-col gap-y-3 text-gray-700 leading-relaxed max-w-3xl">
            <p>
              {SITE_NAME} started in {FOUNDED_YEAR} in {SITE_LOCATION}, with a
              simple idea: building a home or a shop shouldn&apos;t mean
              chasing a dozen different people. Materials, workers and
              engineering advice should be one call, or one website, away.
            </p>
            <p>
              We bring all three together for homeowners, builders and
              contractors in and around {SITE_LOCATION}, so you can plan,
              order and track your construction work in one place.
            </p>
          </div>
        </Card>

        <div>
          <Heading level="h2" className="text-2xl font-bold text-gray-900 mb-4">
            What we do
          </Heading>
          <div className="grid grid-cols-1 medium:grid-cols-3 gap-6">
            {platforms.map((p) => (
              <Card key={p.title}>
                <Text className="text-sm font-semibold text-brand-600 mb-1">
                  {p.eyebrow}
                </Text>
                <Heading level="h3" className="text-xl font-bold text-gray-900 mb-2">
                  {p.title}
                </Heading>
                <Text className="text-gray-700 leading-relaxed mb-4">
                  {p.text}
                </Text>
                <LocalizedClientLink
                  href={p.href}
                  className="text-brand-600 font-medium hover:underline"
                >
                  {p.cta} →
                </LocalizedClientLink>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <Heading level="h2" className="text-2xl font-bold text-gray-900 mb-4">
            How it works
          </Heading>
          <div className="grid grid-cols-1 small:grid-cols-2 medium:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <Card key={s.title}>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-600 font-bold mb-3">
                  {i + 1}
                </div>
                <Heading level="h3" className="text-lg font-bold text-gray-900 mb-1">
                  {s.title}
                </Heading>
                <Text className="text-gray-700">{s.text}</Text>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <Heading level="h2" className="text-2xl font-bold text-gray-900 mb-4">
            What you can expect
          </Heading>
          <div className="grid grid-cols-1 small:grid-cols-2 gap-6">
            {values.map((v) => (
              <Card key={v.title}>
                <Heading level="h3" className="text-lg font-bold text-gray-900 mb-1">
                  {v.title}
                </Heading>
                <Text className="text-gray-700">{v.text}</Text>
              </Card>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 rounded-lg p-6 small:p-10 flex flex-col small:flex-row small:items-center small:justify-between gap-4">
          <div>
            <Heading level="h2" className="text-2xl font-bold text-white">
              Have a project in mind?
            </Heading>
            <Text className="text-gray-300 mt-1">
              Tell us what you need and we&apos;ll get back to you.
            </Text>
          </div>
          <LocalizedClientLink href="/contact">
            <Button variant="primary" size="large">
              Contact us
            </Button>
          </LocalizedClientLink>
        </div>
      </div>
    </div>
  )
}
