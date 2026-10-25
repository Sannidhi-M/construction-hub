import { Button } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { QuoteRequest } from "@lib/data/quote-requests"
import QuoteRequestCard from "../quote-request-card"

const QuoteRequestOverview = ({
  quoteRequests,
}: {
  quoteRequests: QuoteRequest[]
}) => {
  if (quoteRequests.length) {
    return (
      <div className="flex flex-col gap-y-3 w-full">
        {quoteRequests.map((quoteRequest) => (
          <QuoteRequestCard key={quoteRequest.id} quoteRequest={quoteRequest} />
        ))}
      </div>
    )
  }

  return (
    <div
      className="w-full flex flex-col items-center gap-y-4"
      data-testid="no-quote-requests-container"
    >
      <h2 className="text-large-semi">Nothing to see here</h2>
      <p className="text-base-regular">
        You haven&apos;t requested any quotes yet.
      </p>
      <div className="mt-4">
        <LocalizedClientLink href="/engineering" passHref>
          <Button data-testid="get-quote-button">Get a free quote</Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default QuoteRequestOverview
