"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { getAuthHeaders } from "./cookies"

export type LabourBooking = {
  id: string
  service_slug: string
  service_name: string
  rate_type: "day" | "hour"
  rate_amount: number
  start_date: string | null
  end_date: string | null
  scheduled_time: string | null
  duration_hours: number | null
  num_workers: number
  address_1: string
  landmark: string | null
  city: string
  postal_code: string
  phone: string
  email: string | null
  customer_id: string | null
  payment_method: "upi" | "cod"
  payment_customer_confirmed: boolean
  payment_received: boolean
  status: "requested" | "confirmed" | "completed" | "cancelled"
  admin_note: string | null
  created_at: string
}

export type CreateLabourBookingInput = {
  service_slug: string
  service_name: string
  rate_type: "day" | "hour"
  rate_amount: number
  start_date?: string
  end_date?: string
  scheduled_time?: string
  duration_hours?: number
  num_workers: number
  address_1: string
  landmark?: string
  city: string
  postal_code: string
  phone: string
  email?: string
  payment_method: "upi" | "cod"
}

// Not cached — same reasoning as orders (lib/data/orders.ts): a booking's
// status/payment state changes via admin actions this app never sees, so a
// stale cached read could show an outdated status indefinitely.
export const createLabourBooking = async (
  input: CreateLabourBookingInput
): Promise<LabourBooking> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<{ booking: LabourBooking }>("/store/labour-bookings", {
      method: "POST",
      body: input,
      headers,
    })
    .then(({ booking }) => booking)
    .catch((err) => medusaError(err))
}

export const retrieveLabourBooking = async (
  id: string
): Promise<LabourBooking | null> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<{ booking: LabourBooking }>(`/store/labour-bookings/${id}`, {
      method: "GET",
      headers,
      cache: "no-store",
    })
    .then(({ booking }) => booking)
    .catch(() => null)
}

/**
 * "I've Paid" self-report for a UPI booking — a hint for admin only, same
 * semantics as the equivalent order action (see the backend route).
 */
export const confirmLabourBookingPaymentSubmitted = async (
  bookingId: string
) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch(`/store/labour-bookings/${bookingId}/payment-submitted`, {
      method: "POST",
      headers,
    })
    .catch((err) => medusaError(err))
}
