import { DocumentText } from "@medusajs/icons"
import { Badge } from "@modules/common/components/ui"
import { ChevronRight } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { QuoteRequest } from "@lib/data/quote-requests"
import {
  QUOTE_STATUS_COLOR,
  QUOTE_STATUS_LABEL,
  quoteRequestNumber,
} from "@lib/util/quote-request"

// Same compact row as the Materials OrderCard and the Labour booking card
// (icon tile · title · status, whole row is the link) so the three tabs read
// as one consistent list. There's no per-service photo for engineering, so
// the thumbnail slot holds an icon tile instead.
const QuoteRequestCard = ({ quoteRequest }: { quoteRequest: QuoteRequest }) => {
  return (
    <LocalizedClientLink
      href={`/account/orders/engineering/${quoteRequest.id}`}
      className="group flex flex-wrap items-center gap-x-4 gap-y-3 small:flex-nowrap small:gap-x-6 bg-white border border-gray-200 rounded-lg p-3 small:p-4 hover:border-gray-300 hover:shadow-md transition-shadow"
      data-testid="quote-request-card"
    >
      <div className="flex w-16 small:w-20 aspect-square shrink-0 items-center justify-center rounded-large bg-brand-50 text-brand-600">
        <DocumentText className="w-7 h-7" />
      </div>

      <div className="flex flex-1 min-w-0 flex-col gap-y-1">
        <span className="flex items-center gap-x-2 min-w-0">
          <span className="text-base-semi text-gray-900 truncate">
            {quoteRequest.service_name}
          </span>
          {quoteRequest.is_free_claim && (
            <Badge color="green" className="shrink-0" data-testid="quote-free-badge">
              FREE
            </Badge>
          )}
        </span>
        <span className="text-small-regular text-ui-fg-subtle">
          Requested on {new Date(quoteRequest.created_at).toDateString()}
        </span>
        <span className="text-small-regular text-ui-fg-subtle">
          Reference #
          <span data-testid="quote-number">{quoteRequestNumber(quoteRequest)}</span>
        </span>
      </div>

      {/* Own row on a phone (no room beside the details). */}
      <div className="flex w-full justify-start small:w-auto small:shrink-0">
        <Badge
          color={QUOTE_STATUS_COLOR[quoteRequest.status]}
          className="whitespace-normal"
          data-testid="quote-status"
        >
          {QUOTE_STATUS_LABEL[quoteRequest.status]}
        </Badge>
      </div>

      <ChevronRight
        className="hidden small:block shrink-0 text-gray-400 group-hover:text-gray-600"
        data-testid="quote-details-link"
      />
    </LocalizedClientLink>
  )
}

export default QuoteRequestCard
