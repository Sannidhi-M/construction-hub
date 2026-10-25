import { ChatBubbleLeftRight } from "@medusajs/icons"
import { Button, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"

// Shared "Need help?" footer for the order, booking and quote-request detail
// pages. It's deliberately a boxed callout rather than plain text: sitting
// bare under the last section, it read as part of the order itself. Just a
// way to reach the business, so one action.
const Help = () => {
  return (
    <div
      className="mt-4 flex items-center justify-between gap-4 bg-gray-50 border border-gray-200 rounded-lg p-4 small:p-5"
      data-testid="need-help"
    >
      <div className="flex items-center gap-x-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <ChatBubbleLeftRight />
        </div>
        <Text className="font-semibold text-gray-900">Need help?</Text>
      </div>
      <LocalizedClientLink href="/contact">
        <Button variant="outline-brand">Contact us</Button>
      </LocalizedClientLink>
    </div>
  )
}

export default Help
