/**
 * Customer-facing order status mapping (§2.7). Medusa's own
 * `payment_status`/`fulfillment_status`/`status` vocabulary is internal
 * plumbing, not something a customer should have to interpret — this pure,
 * stateless mapping turns that pair into one of these labels, and is
 * consumed by both the storefront order pages and mirrored (via the same
 * logic re-implemented against `AdminOrder`) by the admin order widget so
 * the two sides never show contradictory labels for the same order.
 *
 * `payment_status`/`fulfillment_status` are Medusa's own *aggregate*
 * status across an order's payment/fulfillment collections (computed by
 * core-flows' `getLastPaymentStatus`/`getLastFulfillmentStatus`) — not the
 * lower-level payment *session* status.
 *
 * Confirmed against a live order (Phase 4 testing): the built-in
 * `pp_system` provider auto-authorizes its payment session the moment
 * `completeCartWorkflow` runs — there's no real gateway auth step for a
 * placeholder provider, so "authorized" happens instantly and carries no
 * information about whether the UPI money has actually arrived. Only a
 * *capture* (the admin's manual "Mark Payment Verified" action, §3.2)
 * means that. So `payment_status = authorized`/`partially_authorized`
 * still counts as "Payment Pending" here — only `captured`/
 * `partially_captured` count as paid. (This is a deliberate deviation
 * from §2.7's literal table, which assumed authorization itself was the
 * pending state; that doesn't hold for this provider in practice.)
 */

export type CustomerOrderStatus =
  | "Payment Pending"
  | "Payment Verification Pending"
  | "Order Confirmed"
  | "Order Processing"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled"

type OrderStatusInput = {
  status: string
  payment_status: string
  fulfillment_status: string
}

const PAID_STATUSES = new Set(["captured", "partially_captured"])

/**
 * @param customerConfirmedPayment - the "I've Paid" self-report (§4.2) —
 * `order.metadata.payment_customer_confirmed`. Taken as a separate param
 * rather than read off `order.metadata` directly because `metadata` isn't
 * available on every route this runs against (the single-order GET route
 * doesn't expose it at all — see retrieveOrderPaymentConfirmation); each
 * caller passes whatever it already has for this order.
 */
/**
 * @param paymentMethod - `order.metadata.payment_method`. For "cod" the order
 * is "Order Confirmed" as soon as it's placed, since cash is collected at
 * delivery; "Order Confirmed" means placed, not paid, for COD orders.
 */
export function getCustomerOrderStatus(
  order: OrderStatusInput,
  customerConfirmedPayment?: boolean,
  paymentMethod?: "upi" | "cod"
): CustomerOrderStatus {
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
      return "Order Processing"
  }

  if (paymentMethod === "cod") {
    return "Order Confirmed"
  }

  if (PAID_STATUSES.has(order.payment_status)) {
    return "Order Confirmed"
  }

  if (customerConfirmedPayment) {
    return "Payment Verification Pending"
  }

  return "Payment Pending"
}

// Both "Payment Pending" and "Payment Verification Pending" mean the same
// thing for layout purposes (still needs attention, still shows the UPI
// card) — callers deciding whether to show that card should check this
// instead of comparing against "Payment Pending" alone.
export function isAwaitingPayment(status: CustomerOrderStatus): boolean {
  return status === "Payment Pending" || status === "Payment Verification Pending"
}
