import { Metadata } from "next"
import PlatformBanner from "@modules/common/components/platform-banner"
import ContactForm from "@modules/contact/components/contact-form"
import ContactInfo from "@modules/contact/components/contact-info"
import CommonQuestions from "@modules/contact/components/common-questions"
import { retrieveCustomer } from "@lib/data/customer"
import { contactTopics } from "@lib/data/contact-topics"
import { SITE_NAME } from "@lib/constants"

export const metadata: Metadata = {
  title: `Contact Us | ${SITE_NAME}`,
  description:
    "Questions about an order, a booking or a quote? Send us a message or reach us directly.",
}

type Props = {
  searchParams: Promise<{ subject?: string }>
}

export default async function ContactPage(props: Props) {
  const { subject } = await props.searchParams
  const customer = await retrieveCustomer()

  // `?subject=` lets another page open the form with a subject already
  // chosen; an unknown value is ignored rather than trusted.
  const initialTopic = contactTopics.some((topic) => topic.slug === subject)
    ? subject
    : undefined

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)]">
      <PlatformBanner
        eyebrow="Contact"
        title="Contact Us"
        description="Questions about an order, a booking or a quote? Send us a message or reach us directly."
      />
      <div className="content-container py-10">
        {/* Both columns stretch to the same height, so the two cards line up
            top and bottom (their headings sit at the same level). */}
        <div className="grid grid-cols-1 medium:grid-cols-5 gap-8 items-stretch">
          <div className="medium:col-span-3">
            <ContactForm customer={customer} initialTopic={initialTopic} />
          </div>
          <div className="medium:col-span-2">
            <ContactInfo />
          </div>
        </div>
        <div className="mt-8">
          <CommonQuestions />
        </div>
      </div>
    </div>
  )
}
