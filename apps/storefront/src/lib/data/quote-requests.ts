"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { getAuthHeaders } from "./cookies"

export type QuoteRequest = {
  id: string
  service_slug: string
  service_name: string
  name: string
  email: string
  phone: string
  notes: string | null
  status: "new" | "contacted" | "quoted" | "closed"
  created_at: string
}

export type CreateQuoteRequestInput = {
  service_slug: string
  name: string
  email: string
  notes?: string
}

// Phone isn't part of the input on purpose: the backend takes it from the
// signed-in (OTP-verified) customer's own record, never from the request.
export const createQuoteRequest = async (
  input: CreateQuoteRequestInput
): Promise<QuoteRequest> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<{ quote_request: QuoteRequest }>("/store/quote-requests", {
      method: "POST",
      body: input,
      headers,
    })
    .then(({ quote_request }) => quote_request)
    .catch((err) => medusaError(err))
}
