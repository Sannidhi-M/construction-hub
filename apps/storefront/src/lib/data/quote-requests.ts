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
  // This request used the customer's one free service.
  is_free_claim: boolean
  status: "new" | "contacted" | "quoted" | "closed"
  created_at: string
}

export type CreateQuoteRequestInput = {
  service_slug: string
  name: string
  email: string
  notes?: string
  // Use the customer's one free service (the backend enforces the rules).
  claim_free?: boolean
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

// Not cached — same reasoning as orders and labour bookings: the status is
// changed from Admin, which this app never sees, so a cached read could show
// an outdated status indefinitely.
//
/**
 * The signed-in customer's own quote requests, newest first. `null` on any
 * error (matching `listOrders`/`listLabourBookings`), so a failed load can be
 * told apart from "genuinely has none" (an empty array).
 */
export const listQuoteRequests = async (): Promise<QuoteRequest[] | null> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<{ quote_requests: QuoteRequest[] }>("/store/quote-requests", {
      method: "GET",
      headers,
      cache: "no-store",
    })
    .then(({ quote_requests }) => quote_requests)
    .catch(() => null)
}

export const retrieveQuoteRequest = async (
  id: string
): Promise<QuoteRequest | null> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  // null covers both a nonexistent request and one that isn't the signed-in
  // customer's own — the backend route enforces ownership.
  return sdk.client
    .fetch<{ quote_request: QuoteRequest }>(`/store/quote-requests/${id}`, {
      method: "GET",
      headers,
      cache: "no-store",
    })
    .then(({ quote_request }) => quote_request)
    .catch(() => null)
}

/**
 * The signed-in customer's free-service claim, or null if they haven't made
 * one (or can't be checked: signed out, or the list failed to load — the
 * backend still refuses a second claim at submit).
 */
export const retrieveFreeClaim = async (): Promise<QuoteRequest | null> => {
  const requests = await listQuoteRequests()
  return requests?.find((request) => request.is_free_claim) ?? null
}
