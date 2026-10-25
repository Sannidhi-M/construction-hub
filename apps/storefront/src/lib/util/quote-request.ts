import type { QuoteRequest } from "@lib/data/quote-requests"

/**
 * Customer-facing presentation of a quote request, shared by the account's
 * "My Orders & Requests" → Engineering list rows and detail page (same idea as
 * lib/util/labour-booking.ts). The statuses are the Admin-driven internal
 * ones; these are the words a customer sees for them.
 */

export type QuoteRequestStatus = QuoteRequest["status"]

export const QUOTE_STATUS_COLOR: Record<
  QuoteRequestStatus,
  "orange" | "blue" | "purple" | "green"
> = {
  new: "orange",
  contacted: "blue",
  quoted: "purple",
  closed: "green",
}

export const QUOTE_STATUS_LABEL: Record<QuoteRequestStatus, string> = {
  new: "Received",
  contacted: "We've called you",
  quoted: "Quote shared",
  closed: "Closed",
}

// The lifecycle in order. Unlike a labour booking there's no "cancelled"
// exit — a request just ends at "closed" — so every status is a step.
export const QUOTE_STEPS = ["new", "contacted", "quoted", "closed"] as const

export const QUOTE_STEP_HINT: Record<QuoteRequestStatus, string> = {
  new: "We've received your request",
  contacted: "Our team has reached out to you",
  quoted: "We've shared a quote with you",
  closed: "This request is complete",
}

export const quoteRequestNumber = (quoteRequest: Pick<QuoteRequest, "id">) =>
  quoteRequest.id.slice(-8).toUpperCase()
