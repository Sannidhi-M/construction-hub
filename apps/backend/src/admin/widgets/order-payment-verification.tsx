import { useState } from "react"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminOrder } from "@medusajs/types"
import { Button, Container, Heading, StatusBadge, Text, Textarea, toast } from "@medusajs/ui"
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

  const payment = order.payment_collections
    ?.flatMap((pc) => pc.payments ?? [])
    ?.[0]

  const alreadyVerified = !!payment?.captured_at
  const customerStatus = getCustomerOrderStatus(order)

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
        <Heading level="h2">UPI Payment Verification</Heading>
        <StatusBadge color={alreadyVerified ? "green" : "orange"}>
          {customerStatus}
        </StatusBadge>
      </div>
      <div className="px-6 py-4 flex flex-col gap-y-4">
        <Text size="small" className="text-ui-fg-subtle">
          {alreadyVerified
            ? "This order's payment has already been verified and captured."
            : "Check your UPI app/bank statement for this order's payment before confirming — this action captures the payment and cannot be undone from here."}
        </Text>
        {!alreadyVerified && (
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
                Mark Payment Verified
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
