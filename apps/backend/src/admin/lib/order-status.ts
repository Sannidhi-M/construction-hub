/**
 * Admin-side mirror of the storefront's customer-facing status mapping
 * (apps/storefront/src/lib/util/order-status.ts, §2.7). Kept as a small
 * duplicate rather than a shared import — the admin dashboard and the
 * storefront are separate bundles — so keep the two in sync by hand if
 * this logic ever changes.
 *
 * Only `captured`/`partially_captured` count as paid here — the built-in
 * `pp_system` provider auto-authorizes at checkout regardless of whether
 * the UPI money has arrived, so "authorized" alone doesn't mean verified.
 * See the storefront copy for the full explanation (confirmed live during
 * Phase 4 testing).
 */

export type CustomerOrderStatus =
  | "Payment Pending"
  | "Order Confirmed"
  | "Processing"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled"

type OrderStatusInput = {
  status: string
  payment_status: string
  fulfillment_status: string
}

const PAID_STATUSES = new Set(["captured", "partially_captured"])

export function getCustomerOrderStatus(order: OrderStatusInput): CustomerOrderStatus {
  if (order.status === "canceled") {
    return "Cancelled"
  }

  switch (order.fulfillment_status) {
    case "delivered":
    case "partially_delivered":
      return "Delivered"
    case "shipped":
    case "partially_shipped":
      return "Out for Delivery"
    case "fulfilled":
    case "partially_fulfilled":
      return "Processing"
  }

  if (PAID_STATUSES.has(order.payment_status)) {
    return "Order Confirmed"
  }

  return "Payment Pending"
}
