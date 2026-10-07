"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { initiatePaymentSession, placeOrder } from "@lib/data/cart"
import {
  addCustomerAddress,
  completePhoneSignup,
  retrieveCustomer,
} from "@lib/data/customer"
import { listCartPaymentMethods } from "@lib/data/payment"
import ErrorMessage from "@modules/checkout/components/error-message"
import PhoneLogin from "@modules/account/components/phone-login"
import { useCheckoutSaving } from "@modules/checkout/components/checkout-saving-context"
import { Button, Text } from "@modules/common/components/ui"

// Fast, non-blocking UX feedback for the minimum-order-value decision
// (§2.5) — the authoritative check is the completeCartWorkflow validate
// hook on the backend (src/workflows/hooks/validate-minimum-order-value.ts),
// which rejects checkout regardless of what this shows. Unset/0 disables
// the check entirely (no minimum), same default as the backend.
const MIN_ORDER_VALUE_INR = Number(process.env.NEXT_PUBLIC_MIN_ORDER_VALUE_INR ?? 0)

const Review = ({
  cart,
  customer,
  activeStep,
}: {
  cart: HttpTypes.StoreCart
  customer: HttpTypes.StoreCustomer | null
  activeStep?: string
}) => {
  const router = useRouter()
  const { isSaving: isCheckoutSaving } = useCheckoutSaving()

  // `cart.customer_id` isn't a safe signal here — Medusa auto-links a guest
  // cart to an existing customer record purely by email match at the
  // address step, with no authentication involved. Whether this *session*
  // is actually signed in only comes from `customer` (retrieveCustomer()
  // succeeding, i.e. a valid auth token in the cookie).
  const isVerifiedCustomer = !!customer

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards &&
    ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])
      ?.length > 0 &&
    cart?.total === 0
  )

  const cartTotal = Number(cart.total ?? 0)
  const belowMinimumOrderValue =
    MIN_ORDER_VALUE_INR > 0 && cartTotal < MIN_ORDER_VALUE_INR

  const previousStepsCompleted =
    !!cart.shipping_address && (cart.shipping_methods?.length ?? 0) > 0

  // Saves the address just typed for checkout as the customer's default
  // billing + shipping address — but only when they don't already have one
  // saved, so this never overwrites a default an existing customer already
  // manages themselves (addCustomerAddress's is_default flags would
  // otherwise collide with one that's already set).
  const saveCartAddressAsDefaultIfNone = async () => {
    const shippingAddress = cart.shipping_address
    if (!shippingAddress) {
      return
    }

    const freshCustomer = await retrieveCustomer()
    if ((freshCustomer?.addresses?.length ?? 0) > 0) {
      return
    }

    const addressFormData = new FormData()
    addressFormData.set("first_name", shippingAddress.first_name ?? "")
    addressFormData.set("last_name", shippingAddress.last_name ?? "")
    addressFormData.set("company", shippingAddress.company ?? "")
    addressFormData.set("address_1", shippingAddress.address_1 ?? "")
    addressFormData.set("address_2", shippingAddress.address_2 ?? "")
    addressFormData.set("city", shippingAddress.city ?? "")
    addressFormData.set("postal_code", shippingAddress.postal_code ?? "")
    addressFormData.set("province", shippingAddress.province ?? "")
    addressFormData.set("country_code", shippingAddress.country_code ?? "")
    addressFormData.set("phone", shippingAddress.phone ?? "")

    await addCustomerAddress(
      { isDefaultBilling: true, isDefaultShipping: true },
      addressFormData
    )
  }

  // Fires once whenever `customer` transitions from signed-out to
  // signed-in while this component is mounted — covers a recognized phone
  // logging in. This is driven by Review's own prop, not a callback from
  // PhoneLogin: a recognized-phone verification both authenticates *and*
  // triggers Next's automatic post-server-action page refresh in the same
  // response, and that refresh swaps PhoneLogin out of the tree (since
  // `customer` is now truthy) — which can unmount it before its own
  // `onVerified` effect gets a chance to fire. Tying this to Review's own
  // prop update instead means it can't be lost to that race (confirmed via
  // live testing — the brand-new-phone path doesn't hit this, since it
  // calls completePhoneSignup directly, with no competing refresh to race).
  const previousCustomerRef = useRef(customer)
  useEffect(() => {
    if (!previousCustomerRef.current && customer) {
      saveCartAddressAsDefaultIfNone()
    }
    previousCustomerRef.current = customer
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer])

  // A brand-new phone number verified at checkout is created as a customer
  // immediately, using the name/email already collected on the shipping
  // address — no extra form, since the shopper already typed those once.
  const handleNewPhone = async ({
    phone,
    token,
  }: {
    phone: string
    token: string
  }) => {
    const formData = new FormData()
    formData.set("phone", phone)
    formData.set("token", token)
    formData.set("email", cart.email ?? "")
    formData.set("first_name", cart.shipping_address?.first_name ?? "")
    formData.set("last_name", cart.shipping_address?.last_name ?? "")

    const result = await completePhoneSignup(null, formData)
    if (result?.state === "error") {
      setError(result.error)
      return
    }

    // Save the address they just typed for checkout as their first saved
    // address (and default billing address) — no reason to make them
    // retype it next time, or leave "Manage Addresses"/the billing address
    // on their profile looking empty right after they've placed an order.
    await saveCartAddressAsDefaultIfNone()

    router.refresh()
  }

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

  // Hidden while the address step is open — avoids showing "Place order"
  // (or the phone-verification box) at the same time as "Continue to
  // review", which is confusing: only one call-to-action at a time.
  if (!previousStepsCompleted || activeStep === "address") {
    return null
  }

  return (
    <div className="border-t border-gray-200 mt-6 pt-6">
      {belowMinimumOrderValue ? (
        <Text
          className="txt-medium text-rose-500"
          data-testid="minimum-order-value-message"
        >
          A minimum order of ₹{MIN_ORDER_VALUE_INR} is required to check
          out. Add ₹{MIN_ORDER_VALUE_INR - cartTotal} more to your cart to
          continue.
        </Text>
      ) : !isVerifiedCustomer ? (
        <div data-testid="checkout-phone-verification">
          <Text className="txt-medium-plus text-ui-fg-base mb-4">
            Verify your phone number to place your order.
          </Text>
          <PhoneLogin
            onVerified={() => router.refresh()}
            onNewPhone={handleNewPhone}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          <Button
            size="large"
            onClick={handlePlaceOrder}
            isLoading={submitting}
            disabled={isCheckoutSaving}
            data-testid="submit-order-button"
            className="w-full"
          >
            Place order
          </Button>
          <Text className="txt-small text-ui-fg-subtle mt-3">
            By placing this order, you agree to our Terms of Service.
          </Text>
        </div>
      )}
      <ErrorMessage error={error} data-testid="review-error-message" />
    </div>
  )
}

export default Review
