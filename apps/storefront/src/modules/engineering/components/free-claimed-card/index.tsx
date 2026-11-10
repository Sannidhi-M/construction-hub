import { CheckCircleSolid } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Badge, Button, Heading, Text } from "@modules/common/components/ui"
import { QuoteRequest } from "@lib/data/quote-requests"
import {
  QUOTE_STATUS_COLOR,
  QUOTE_STATUS_LABEL,
  quoteRequestNumber,
} from "@lib/util/quote-request"

/**
 * What a customer sees after clicking "Claim your free service" once they
 * already have: that it's used, which request it was, where it stands, and a
 * way to open it in My Orders — or carry on with an ordinary quote.
 */
const FreeClaimedCard = ({ request }: { request: QuoteRequest }) => {
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 small:p-10"
      data-testid="free-already-claimed"
    >
      <div className="flex items-center gap-x-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white">
          <CheckCircleSolid className="w-6 h-6" />
        </span>
        <Heading level="h2" className="text-xl small:text-2xl font-bold text-gray-900">
          You&apos;ve already claimed your free service
        </Heading>
      </div>
      <Text className="text-gray-600 mt-3">
        Each customer gets one free service, and yours is already with our
        team. Here are its details.
      </Text>

      <dl className="mt-6 grid grid-cols-1 small:grid-cols-2 gap-x-8 gap-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 small:p-5">
        <div>
          <dt className="text-small-regular text-ui-fg-subtle">Service</dt>
          <dd className="text-base-semi text-gray-900">{request.service_name}</dd>
        </div>
        <div>
          <dt className="text-small-regular text-ui-fg-subtle">Status</dt>
          <dd className="mt-0.5">
            <Badge color={QUOTE_STATUS_COLOR[request.status]}>
              {QUOTE_STATUS_LABEL[request.status]}
            </Badge>
          </dd>
        </div>
        <div>
          <dt className="text-small-regular text-ui-fg-subtle">Requested on</dt>
          <dd className="text-base-semi text-gray-900">
            {new Date(request.created_at).toDateString()}
          </dd>
        </div>
        <div>
          <dt className="text-small-regular text-ui-fg-subtle">Reference</dt>
          <dd className="text-base-semi text-gray-900">
            #{quoteRequestNumber(request)}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col small:flex-row gap-3">
        <LocalizedClientLink href={`/account/orders/engineering/${request.id}`}>
          <Button size="large" className="w-full small:w-auto" data-testid="free-claimed-view">
            View request details
          </Button>
        </LocalizedClientLink>
        <LocalizedClientLink href="/engineering/quote">
          <Button variant="secondary" size="large" className="w-full small:w-auto">
            Get a regular quote
          </Button>
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default FreeClaimedCard
