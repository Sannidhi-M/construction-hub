import { SITE_NAME, whatsappUrl } from "@lib/constants"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Text } from "@modules/common/components/ui"
import WhatsApp from "@modules/common/icons/whatsapp"

/**
 * "Report a problem" for a delivered order: opens a WhatsApp chat with the
 * business with the order number already typed in (the customer adds photos
 * and presses send). There is no online returns form — returns are handled by
 * the business by hand, so this is just the easy first step. Shown only once
 * the order is Delivered (see order-details-template.tsx).
 */
const ReportProblem = ({ displayId }: { displayId: number | string }) => {
  const href = whatsappUrl(
    `Hi ${SITE_NAME}, I'd like to report a problem with my order #${displayId}.`
  )

  return (
    <div
      className="mt-4 flex flex-col small:flex-row small:items-center small:justify-between gap-4 bg-white border border-gray-200 rounded-lg p-4 small:p-5"
      data-testid="report-problem"
    >
      <div>
        <Text className="font-semibold text-gray-900">
          Something wrong with your delivery?
        </Text>
        <Text className="txt-small text-ui-fg-subtle mt-1">
          Damaged, wrong or missing items: message us on WhatsApp with photos.
          See our{" "}
          <LocalizedClientLink href="/refund-policy" className="underline">
            refund &amp; cancellation policy
          </LocalizedClientLink>
          .
        </Text>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-rounded bg-[#25D366] px-5 font-semibold text-white hover:opacity-90"
        data-testid="report-problem-button"
      >
        <WhatsApp size={18} />
        Report a problem
      </a>
    </div>
  )
}

export default ReportProblem
