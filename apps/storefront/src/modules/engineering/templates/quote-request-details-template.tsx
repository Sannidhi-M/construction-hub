import { XMark } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import DetailField from "@modules/common/components/detail-field"
import Help from "@modules/order/components/help"
import StatusTracker from "@modules/common/components/status-tracker"
import { Badge, Heading, Text } from "@modules/common/components/ui"
import { QuoteRequest } from "@lib/data/quote-requests"
import {
  QUOTE_STATUS_COLOR,
  QUOTE_STATUS_LABEL,
  QUOTE_STEPS,
  QUOTE_STEP_HINT,
  quoteRequestNumber,
} from "@lib/util/quote-request"

const QuoteRequestDetailsTemplate = ({
  quoteRequest,
}: {
  quoteRequest: QuoteRequest
}) => {
  return (
    <div className="flex flex-col justify-center gap-y-4">
      <div className="flex gap-2 justify-between items-center">
        <h1 className="text-2xl-semi">Request details</h1>
        <LocalizedClientLink
          href="/account/orders?tab=engineering"
          className="flex gap-2 items-center text-ui-fg-subtle hover:text-ui-fg-base"
          data-testid="back-to-overview-button"
        >
          <XMark /> Back to overview
        </LocalizedClientLink>
      </div>

      <div
        className="flex flex-col gap-4 h-full bg-white w-full"
        data-testid="quote-details-container"
      >
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 small:p-6">
          <div className="flex flex-wrap items-start justify-between gap-y-3">
            <div className="flex flex-col gap-y-2">
              <DetailField
                label="Reference"
                value={`#${quoteRequestNumber(quoteRequest)}`}
                highlight
              />
              <DetailField
                label="Requested on"
                value={new Date(quoteRequest.created_at).toDateString()}
              />
              <DetailField label="Service" value={quoteRequest.service_name} />
              <DetailField label="Name" value={quoteRequest.name} />
              <DetailField label="Email" value={quoteRequest.email} />
              <DetailField label="Phone" value={quoteRequest.phone} />
            </div>
            <Badge
              color={QUOTE_STATUS_COLOR[quoteRequest.status]}
              data-testid="quote-status"
            >
              {QUOTE_STATUS_LABEL[quoteRequest.status]}
            </Badge>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <Heading level="h2" className="text-3xl-regular mb-4">
            Request status
          </Heading>
          <StatusTracker
            testIdPrefix="quote"
            currentIndex={QUOTE_STEPS.indexOf(quoteRequest.status)}
            steps={QUOTE_STEPS.map((step) => ({
              key: step,
              label: QUOTE_STATUS_LABEL[step],
              hint: QUOTE_STEP_HINT[step],
            }))}
          />
        </div>

        {quoteRequest.notes && (
          <div className="border-t border-gray-200 pt-6">
            <Heading level="h2" className="text-3xl-regular mb-4">
              Your notes
            </Heading>
            <Text className="txt-medium text-ui-fg-subtle whitespace-pre-wrap break-words">
              {quoteRequest.notes}
            </Text>
          </div>
        )}

        <Help />
      </div>
    </div>
  )
}

export default QuoteRequestDetailsTemplate
