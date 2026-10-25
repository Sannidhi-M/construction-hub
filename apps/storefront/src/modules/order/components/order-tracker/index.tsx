import CancelledNotice from "@modules/common/components/cancelled-notice"
import StatusTracker, {
  TrackerStep,
} from "@modules/common/components/status-tracker"
import { CustomerOrderStatus } from "@lib/util/order-status"

/**
 * Delivery progress for a Materials order, drawn from the same derived
 * customer-facing status the badge shows (lib/util/order-status.ts, §2.7) —
 * so the tracker and the badge can never disagree.
 *
 * The status has two payment-pending states that come *before* "Order
 * Confirmed" (UPI orders waiting on payment). They aren't steps of their own
 * here: the order exists, so "Order placed" is reached, and the next step's
 * hint says what it's waiting for. COD orders skip straight to confirmed
 * (§2.7), so for them that wait never shows.
 */

const STEP_KEYS = [
  "placed",
  "confirmed",
  "processing",
  "out-for-delivery",
  "delivered",
] as const

const CURRENT_INDEX: Record<
  Exclude<CustomerOrderStatus, "Cancelled">,
  number
> = {
  "Payment Pending": 0,
  "Payment Verification Pending": 0,
  "Order Confirmed": 1,
  "Order Processing": 2,
  "Out for Delivery": 3,
  Delivered: 4,
}

const confirmedHint = (
  status: CustomerOrderStatus,
  paymentMethod?: "upi" | "cod"
) => {
  if (status === "Payment Pending") {
    return "Waiting for your payment"
  }
  if (status === "Payment Verification Pending") {
    return "We're verifying your payment"
  }
  return paymentMethod === "cod"
    ? "Confirmed — pay cash on delivery"
    : "Payment verified — your order is confirmed"
}

const OrderTracker = ({
  status,
  paymentMethod,
}: {
  status: CustomerOrderStatus
  paymentMethod?: "upi" | "cod"
}) => {
  if (status === "Cancelled") {
    return (
      <CancelledNotice
        message="This order was cancelled."
        testId="order-tracker-cancelled"
      />
    )
  }

  const steps: TrackerStep[] = [
    { key: STEP_KEYS[0], label: "Order placed", hint: "We've received your order" },
    {
      key: STEP_KEYS[1],
      label: "Order confirmed",
      hint: confirmedHint(status, paymentMethod),
    },
    { key: STEP_KEYS[2], label: "Processing", hint: "We're preparing your order" },
    { key: STEP_KEYS[3], label: "Out for delivery", hint: "On its way to you" },
    { key: STEP_KEYS[4], label: "Delivered", hint: "Delivered to your site" },
  ]

  return (
    <StatusTracker
      testIdPrefix="order"
      currentIndex={CURRENT_INDEX[status]}
      steps={steps}
    />
  )
}

export default OrderTracker
