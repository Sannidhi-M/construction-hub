import { Metadata } from "next"
import QuotePageTemplate from "@modules/engineering/templates/quote-page-template"
import { retrieveCustomer } from "@lib/data/customer"
import { otherServices } from "@lib/data/engineering-services"
import { SITE_NAME } from "@lib/constants"

export const metadata: Metadata = {
  title: `Get a Free Quote — Other Services | ${SITE_NAME}`,
  description:
    "Precast compound walls, steel fabrication, gates and grills, aluminium and UPVC works, glazing, waterproofing and roofing — request a free quote.",
}

export default async function OtherServicesQuotePage() {
  const customer = await retrieveCustomer()

  return (
    <QuotePageTemplate
      eyebrow="Other Services"
      description="Precast compound walls, steel fabrication, gates and grills, aluminium and UPVC works, glazing, waterproofing and roofing — tell us what you need and we'll get back to you with a free quote."
      services={otherServices}
      customer={customer}
    />
  )
}
