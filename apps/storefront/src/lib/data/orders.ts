"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { getAuthHeaders } from "./cookies"
import { attachProductImages, getProductImagesByIds } from "./products"
import { HttpTypes } from "@medusajs/types"

export const retrieveOrder = async (id: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  // Not cached: an order's payment/fulfillment status (§2.7) changes via
  // admin actions (UPI verification, fulfillment updates) that happen
  // entirely outside this Next.js app — there's no webhook or action here
  // to `revalidateTag` on when that happens, unlike the Stripe flow this
  // replaced. A stale cached order would show "Payment Pending" forever,
  // even after the customer refreshes post-verification (confirmed live
  // during Phase 4 testing).
  return sdk.client
    .fetch<HttpTypes.StoreOrderResponse>(`/store/orders/${id}`, {
      method: "GET",
      query: {
        fields:
          "*payment_collections.payments,*items,*items.metadata,*items.variant,*items.product",
      },
      headers,
      cache: "no-store",
    })
    .then(async ({ order }) => {
      if (order.items?.length) {
        order.items = await attachProductImages(order.items)
      }
      return order
    })
    .catch((err) => medusaError(err))
}

export type CheckoutMetadata = {
  paymentCustomerConfirmed: boolean
  paymentMethod?: "upi" | "cod"
  requestedDeliveryDate?: string
}

/**
 * `order.metadata` specifically, as its own minimal call. Confirmed against
 * Medusa's own source (query-config.js): the single-order GET
 * /store/orders/:id route doesn't have `metadata` in its allowed field
 * list at all — only the LIST route's defaults include it — so a direct
 * retrieve silently drops it no matter how it's requested. Kept separate
 * from retrieveOrder (rather than switching that to the list endpoint)
 * because the list endpoint's own defaults are a much smaller set (no
 * email, shipping_address, totals, etc. unless each is individually
 * requested) — not worth the regression risk for one field.
 */
export const retrieveOrderCheckoutMetadata = async (id: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const empty: CheckoutMetadata = {
    paymentCustomerConfirmed: false,
  }

  return sdk.client
    .fetch<HttpTypes.StoreOrderListResponse>(`/store/orders`, {
      method: "GET",
      query: { id: [id], limit: 1, fields: "id,metadata" },
      headers,
      cache: "no-store",
    })
    .then(({ orders }): CheckoutMetadata => {
      const metadata = orders?.[0]?.metadata
      return {
        paymentCustomerConfirmed: !!metadata?.payment_customer_confirmed,
        paymentMethod: metadata?.payment_method === "cod" ? "cod" : undefined,
        requestedDeliveryDate:
          typeof metadata?.requested_delivery_date === "string"
            ? metadata.requested_delivery_date
            : undefined,
      }
    })
    .catch(() => empty)
}

/**
 * "I've Paid" (§4.2 extension) — the customer self-reports they've sent
 * the UPI payment. Purely a hint surfaced to the admin; it never captures
 * or otherwise advances payment state (see the backend route for why).
 */
export const confirmPaymentSubmitted = async (orderId: string) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch(`/store/orders/${orderId}/payment-submitted`, {
      method: "POST",
      headers,
    })
    .catch((err) => medusaError(err))
}

export const listOrders = async (
  limit: number = 10,
  offset: number = 0,
  filters?: Record<string, unknown>
) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  // Not cached — same reasoning as retrieveOrder above: this list's
  // per-order status can change via admin actions this app never sees.
  return sdk.client
    .fetch<HttpTypes.StoreOrderListResponse>(`/store/orders`, {
      method: "GET",
      query: {
        limit,
        offset,
        order: "-created_at",
        fields: "*items,+items.metadata,*items.variant,*items.product",
        ...filters,
      },
      headers,
      cache: "no-store",
    })
    .then(async ({ orders }) => {
      // One batched image lookup across every order's items, rather than
      // one per order.
      const imagesByProductId = await getProductImagesByIds(
        orders
          .flatMap((order) => order.items ?? [])
          .map((item) => item.product_id)
          .filter((v): v is string => !!v)
      )

      return Promise.all(
        orders.map(async (order) => {
          if (order.items?.length) {
            order.items = await attachProductImages(order.items, imagesByProductId)
          }
          return order
        })
      )
    })
    .catch((err) => medusaError(err))
}

export const createTransferRequest = async (
  state: {
    success: boolean
    error: string | null
    order: HttpTypes.StoreOrder | null
  },
  formData: FormData
): Promise<{
  success: boolean
  error: string | null
  order: HttpTypes.StoreOrder | null
}> => {
  const id = formData.get("order_id") as string

  if (!id) {
    return { success: false, error: "Order ID is required", order: null }
  }

  const headers = await getAuthHeaders()

  return await sdk.store.order
    .requestTransfer(
      id,
      {},
      {
        fields: "id, email",
      },
      headers
    )
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export const acceptTransferRequest = async (id: string, token: string) => {
  const headers = await getAuthHeaders()

  return await sdk.store.order
    .acceptTransfer(id, { token }, {}, headers)
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}

export const declineTransferRequest = async (id: string, token: string) => {
  const headers = await getAuthHeaders()

  return await sdk.store.order
    .declineTransfer(id, { token }, {}, headers)
    .then(({ order }) => ({ success: true, error: null, order }))
    .catch((err) => ({ success: false, error: err.message, order: null }))
}
