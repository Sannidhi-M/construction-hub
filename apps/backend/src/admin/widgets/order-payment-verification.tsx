import { useState } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminOrder } from "@medusajs/types"
import {
  Button,
  Container,
  Heading,
  Select,
  StatusBadge,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"
import { getCustomerOrderStatus } from "../lib/order-status"

/**
 * "Mark Payment Verified" (§3.2/§3.4) — the only manual step in the whole
 * payment lifecycle, since v1 has no payment gateway: the admin checks
 * their own UPI app/bank statement out of band, then confirms it here.
 * Also surfaces the same derived customer-facing status (§2.7) the
 * storefront shows, so admin and customer are never looking at
 * contradictory labels for the same order.
 */
const OrderPaymentVerificationWidget = ({
  data: order,
}: DetailWidgetProps<AdminOrder>) => {
  const [note, setNote] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [method, setMethod] = useState<"upi" | "cod">("upi")
  const [savingMethod, setSavingMethod] = useState(false)

  const payment = order.payment_collections
    ?.flatMap((pc) => pc.payments ?? [])
    ?.[0]

  const alreadyVerified = !!payment?.captured_at
  // Orders placed through the storefront always have a payment record waiting
  // to be verified. Phone orders made via Draft Orders have none until the
  // owner uses Medusa's own "Mark as paid" (which records and captures it in
  // one step), so there is nothing here to verify.
  const hasNoPayment = !payment
  const customerStatus = getCustomerOrderStatus(order)
  const isCod = order.metadata?.payment_method === "cod"
  const customerConfirmedAt = order.metadata?.payment_customer_confirmed_at as
    | string
    | undefined

  // Website orders carry the customer's UPI/cash choice from checkout; a phone
  // order made via Draft Orders has none until the owner records it here.
  const needsPaymentMethod =
    !order.metadata?.payment_method && order.status !== "canceled"

  const handleSaveMethod = async () => {
    setSavingMethod(true)

    try {
      const res = await fetch(`/admin/orders/${order.id}/payment-method`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_method: method }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message ?? `Request failed (${res.status})`)
      }

      window.location.reload()
    } catch (err) {
      toast.error("Could not save payment method", {
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setSavingMethod(false)
    }
  }

  const handleVerify = async () => {
    setSubmitting(true)

    try {
      const res = await fetch(`/admin/orders/${order.id}/verify-payment`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin_note: note || undefined }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.message ?? `Request failed (${res.status})`)
      }

      toast.success("Payment verified", {
        description: `Order ${order.display_id}'s payment has been marked as captured.`,
      })

      window.location.reload()
    } catch (err) {
      toast.error("Could not verify payment", {
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">
          {isCod ? "Cash on Delivery" : "UPI Payment Verification"}
        </Heading>
        <StatusBadge color={alreadyVerified ? "green" : "orange"}>
          {customerStatus}
        </StatusBadge>
      </div>
      {needsPaymentMethod && (
        <div className="px-6 py-4 flex flex-col gap-y-3">
          <Text size="small" className="text-ui-fg-subtle">
            How will the customer pay for this order? Choose before taking the
            payment — it sets the wording the customer sees.
          </Text>
          <div className="flex items-center gap-x-2">
            <Select
              value={method}
              onValueChange={(value) => setMethod(value as "upi" | "cod")}
            >
              <Select.Trigger className="w-48">
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="upi">UPI</Select.Item>
                <Select.Item value="cod">Cash on delivery</Select.Item>
              </Select.Content>
            </Select>
            <Button
              variant="secondary"
              onClick={handleSaveMethod}
              isLoading={savingMethod}
            >
              Save
            </Button>
          </div>
        </div>
      )}
      <div className="px-6 py-4 flex flex-col gap-y-4">
        <Text size="small" className="text-ui-fg-subtle">
          {alreadyVerified
            ? "This order's payment has already been verified and captured."
            : hasNoPayment
              ? "This order has no payment recorded yet (typical for phone orders made via Draft Orders). Use Medusa's own \"Mark as paid\" in the Payment section above once the money has arrived."
              : isCod
                ? "Collect the cash from the customer at delivery, then confirm here — this action captures the payment and cannot be undone from here."
                : "Check your UPI app/bank statement for this order's payment before confirming — this action captures the payment and cannot be undone from here."}
        </Text>
        {!isCod && !alreadyVerified && customerConfirmedAt && (
          <Text size="small" className="text-ui-fg-subtle">
            Customer marked this as paid on{" "}
            {new Date(customerConfirmedAt).toLocaleString()} — not yet
            independently verified.
          </Text>
        )}
        {!alreadyVerified && !hasNoPayment && (
          <>
            <Textarea
              placeholder="Optional note (e.g. UTR reference, matched bank entry)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
            <div>
              <Button
                variant="primary"
                onClick={handleVerify}
                isLoading={submitting}
              >
                {isCod ? "Mark Cash Collected" : "Mark Payment Verified"}
              </Button>
            </div>
          </>
        )}
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details",
})

export default OrderPaymentVerificationWidget
