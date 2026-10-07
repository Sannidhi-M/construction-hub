"use client"

import { useState } from "react"
import { setDeliveryDate } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import { useCheckoutSaving } from "@modules/checkout/components/checkout-saving-context"
import { Text } from "@modules/common/components/ui"

const toIsoDate = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

const DeliveryDate = ({ cart }: { cart: HttpTypes.StoreCart }) => {
  const today = toIsoDate(new Date())
  const savedDate = cart.metadata?.requested_delivery_date
  const [date, setDate] = useState<string>(
    typeof savedDate === "string" && savedDate ? savedDate : today
  )
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setSaving } = useCheckoutSaving()

  const handleChange = async (next: string) => {
    if (!next || next < today) {
      return
    }

    const previous = date
    setDate(next)
    setError(null)
    setIsSaving(true)
    setSaving("delivery-date", true)

    try {
      await setDeliveryDate(next)
    } catch (err) {
      setDate(previous)
      setError(err instanceof Error ? err.message : "Couldn't save delivery date")
    } finally {
      setIsSaving(false)
      setSaving("delivery-date", false)
    }
  }

  return (
    <div className="mb-6" data-testid="delivery-date">
      <label
        htmlFor="delivery-date-input"
        className="block txt-medium-plus text-ui-fg-base mb-1"
      >
        Delivery date
      </label>
      <Text className="txt-small text-ui-fg-subtle mb-2">
        Choose today or a later date.
      </Text>
      <input
        id="delivery-date-input"
        type="date"
        min={today}
        value={date}
        disabled={isSaving}
        onChange={(e) => handleChange(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50"
        data-testid="delivery-date-input"
      />
      <ErrorMessage error={error} data-testid="delivery-date-error" />
    </div>
  )
}

export default DeliveryDate
