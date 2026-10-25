import { Metadata } from "next"
import QuotePageTemplate from "@modules/engineering/templates/quote-page-template"
import { retrieveCustomer } from "@lib/data/customer"
import { engineeringServices } from "@lib/data/engineering-services"
import { SITE_NAME } from "@lib/constants"

export const metadata: Metadata = {
  title: `Get a Free Quote | ${SITE_NAME}`,
  description:
    "From architectural drawings to complete home construction — request a free quote from our engineers.",
}

export default async function QuotePage() {
  const customer = await retrieveCustomer()

  return (
    <QuotePageTemplate
      eyebrow="Engineering Services"
      description="From architectural drawings to complete home construction — our engineers handle every stage of your project in Davangere."
      services={engineeringServices}
      customer={customer}
    />
  )
}
