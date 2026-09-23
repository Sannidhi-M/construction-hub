"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { initiatePaymentSession, placeOrder } from "@lib/data/cart"
import { listCartPaymentMethods } from "@lib/data/payment"
import ErrorMessage from "@modules/checkout/components/error-message"
import { Button, Heading, Text, clx } from "@modules/common/components/ui"

const Review = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards &&
    ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])
      ?.length > 0 &&
    cart?.total === 0
  )

  const previousStepsCompleted =
    !!cart.shipping_address && (cart.shipping_methods?.length ?? 0) > 0

  // Single-provider (system/manual UPI) payment flow: no payment method
  // choice UI. Instead of a dedicated payment step, Review makes sure a
  // payment session exists (using the storefront's one payment provider)
  // right before placing the order. A later phase replaces this with the
  // real UPI QR / status UI (see docs/ARCHITECTURE.md §4.2, §2.7).
  const handlePlaceOrder = async () => {
    setError(null)
    setSubmitting(true)

    try {
      const activeSession = cart.payment_collection?.payment_sessions?.find(
        (session) => session.status === "pending"
      )

      if (!activeSession && !paidByGiftcard) {
        const paymentMethods = await listCartPaymentMethods(
          cart.region?.id ?? ""
        )
        const providerId = paymentMethods?.[0]?.id

        if (!providerId) {
          throw new Error("No payment method is available for this order.")
        }

        await initiatePaymentSession(cart, { provider_id: providerId })
      }

      await placeOrder()
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline",
            {
              "opacity-50 pointer-events-none select-none": !isOpen,
            }
          )}
        >
          Review
        </Heading>
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          <div className="flex items-start gap-x-1 w-full mb-6">
            <div className="w-full">
              <Text className="txt-medium-plus text-ui-fg-base mb-1">
                By clicking the Place Order button, you confirm that you have
                read, understand and accept our Terms of Use, Terms of Sale and
                Returns Policy and acknowledge that you have read Medusa
                Store&apos;s Privacy Policy.
              </Text>
            </div>
          </div>
          <Button
            size="large"
            onClick={handlePlaceOrder}
            isLoading={submitting}
            data-testid="submit-order-button"
          >
            Place order
          </Button>
          <ErrorMessage error={error} data-testid="review-error-message" />
        </>
      )}
    </div>
  )
}

export default Review
