import { retrieveQuoteRequest } from "@lib/data/quote-requests"
import { quoteRequestNumber } from "@lib/util/quote-request"
import QuoteRequestDetailsTemplate from "@modules/engineering/templates/quote-request-details-template"
import { Metadata } from "next"
import { notFound } from "next/navigation"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const quoteRequest = await retrieveQuoteRequest(params.id)

  if (!quoteRequest) {
    notFound()
  }

  return {
    title: `Quote request #${quoteRequestNumber(quoteRequest)}`,
    description: "View your quote request",
  }
}

export default async function QuoteRequestDetailPage(props: Props) {
  const params = await props.params
  // null covers both a nonexistent request and one that isn't the signed-in
  // customer's own — the backend route enforces ownership.
  const quoteRequest = await retrieveQuoteRequest(params.id)

  if (!quoteRequest) {
    notFound()
  }

  return <QuoteRequestDetailsTemplate quoteRequest={quoteRequest} />
}
