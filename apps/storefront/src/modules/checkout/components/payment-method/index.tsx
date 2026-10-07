"use client"

import { useState } from "react"
import { setPaymentMethod } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useCheckoutSaving } from "@modules/checkout/components/checkout-saving-context"
import { Heading, Text } from "@modules/common/components/ui"

type PaymentChoice = "upi" | "cod"

const OPTIONS: { value: PaymentChoice; label: string; description: string }[] = [
  {
    value: "upi",
    label: "Pay online with UPI",
    description: "Scan a QR code or pay in your UPI app after placing the order.",
  },
  {
    value: "cod",
    label: "Cash on Delivery",
    description: "Pay in cash when your order is delivered.",
  },
]

const PaymentMethod = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const savedMethod = cart.metadata?.payment_method
  const [method, setMethod] = useState<PaymentChoice>(
    savedMethod === "cod" ? "cod" : "upi"
  )
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setSaving } = useCheckoutSaving()

  const paidByGiftcard = !!(
    (cart as unknown as Record<string, unknown>)?.gift_cards &&
    ((cart as unknown as Record<string, unknown>)?.gift_cards as unknown[])
      ?.length > 0 &&
    cart.total === 0
  )

  if (paidByGiftcard) {
    return null
  }

  const handleChange = async (next: PaymentChoice) => {
    if (next === method) {
      return
    }

    const previous = method
    setMethod(next)
    setError(null)
    setIsSaving(true)
    setSaving("payment-method", true)

    try {
      await setPaymentMethod(next)
    } catch (err) {
      setMethod(previous)
      setError(err instanceof Error ? err.message : "Couldn't save payment method")
    } finally {
      setIsSaving(false)
      setSaving("payment-method", false)
    }
  }

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 small:p-8"
      data-testid="payment-method"
    >
      <Heading level="h2" className="text-3xl-regular mb-2">
        Payment method
      </Heading>
      <Text className="txt-small text-ui-fg-subtle mb-6">
        Choose how you would like to pay for this order.
      </Text>
      <div role="radiogroup" className="flex flex-col gap-y-3">
        {OPTIONS.map((option) => {
          const checked = method === option.value
          return (
            <label
              key={option.value}
              className={`flex items-start gap-x-3 border rounded-md p-4 cursor-pointer transition-colors ${
                checked
                  ? "border-brand-500 bg-brand-50"
                  : "border-gray-200 hover:bg-gray-50"
              } ${isSaving ? "opacity-50 pointer-events-none" : ""}`}
              data-testid={`payment-method-${option.value}`}
            >
              <input
                type="radio"
                name="payment-method"
                value={option.value}
                checked={checked}
                onChange={() => handleChange(option.value)}
                disabled={isSaving}
                className="mt-1 accent-brand-500"
              />
              <span className="flex flex-col">
                <span className="txt-medium-plus text-ui-fg-base">
                  {option.label}
                </span>
                <span className="txt-small text-ui-fg-subtle">
                  {option.description}
                </span>
              </span>
            </label>
          )
        })}
      </div>
      <ErrorMessage error={error} data-testid="payment-method-error" />
    </div>
  )
}

export default PaymentMethod
