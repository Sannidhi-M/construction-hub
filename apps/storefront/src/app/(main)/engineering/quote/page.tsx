import { Metadata } from "next"
import QuotePageTemplate from "@modules/engineering/templates/quote-page-template"
import { retrieveCustomer } from "@lib/data/customer"
import { engineeringServices } from "@lib/data/engineering-services"
import { freeServices } from "@lib/data/free-service"
import { retrieveFreeClaim } from "@lib/data/quote-requests"
import { SITE_NAME } from "@lib/constants"

export const metadata: Metadata = {
  title: `Get a Free Quote | ${SITE_NAME}`,
  description:
    "From architectural drawings to complete home construction — request a free quote from our engineers.",
}

export default async function QuotePage({
  searchParams,
}: {
  searchParams: Promise<{ free?: string }>
}) {
  const { free } = await searchParams
  const customer = await retrieveCustomer()
  const wantsFree = free === "1"
  // Only a signed-in customer can have claimed already; a signed-out visitor
  // is checked by the server when they submit.
  const claimedRequest =
    wantsFree && customer ? await retrieveFreeClaim() : null
  const freeClaim = wantsFree && !claimedRequest

  return (
    <QuotePageTemplate
      eyebrow={wantsFree ? "Welcome offer" : "Engineering Services"}
      title={
        claimedRequest
          ? "Your free service"
          : freeClaim
            ? "Claim your free service"
            : undefined
      }
      description={
        claimedRequest
          ? "You've already used your one free service."
          : freeClaim
            ? "Choose any one service — it's on us. Our engineers will call you back to get started."
            : "From architectural drawings to complete home construction — our engineers handle every stage of your project in Davangere."
      }
      services={freeClaim ? freeServices : engineeringServices}
      customer={customer}
      freeClaim={freeClaim}
      claimedRequest={claimedRequest}
    />
  )
}
