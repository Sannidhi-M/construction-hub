"use client"

import { useState } from "react"
import { checkPincodeServiceable } from "@lib/data/delivery-area"
import { notServiceableMessage } from "@lib/util/pincode"
import { Button, Text } from "@modules/common/components/ui"

type Result =
  | { kind: "yes"; pincode: string }
  | { kind: "no"; pincode: string }
  | { kind: "error"; message: string }

/**
 * "Check delivery to your pincode" on the product page. Uses the same
 * delivery-area check as checkout; it is advisory here (checkout still
 * enforces it).
 */
const DeliveryCheck = () => {
  const [pincode, setPincode] = useState("")
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  const check = async () => {
    if (!/^\d{6}$/.test(pincode)) {
      setResult({ kind: "error", message: "Enter a 6-digit pincode." })
      return
    }

    setChecking(true)
    try {
      const serviceable = await checkPincodeServiceable(pincode)
      setResult(
        serviceable ? { kind: "yes", pincode } : { kind: "no", pincode }
      )
    } catch {
      setResult({
        kind: "error",
        message: "Couldn't check right now. Please try again.",
      })
    } finally {
      setChecking(false)
    }
  }

  return (
    <div
      className="rounded-lg border border-gray-200 bg-gray-50 p-4"
      data-testid="delivery-check"
    >
      <Text className="font-semibold text-gray-900 mb-2">
        Check delivery to your pincode
      </Text>
      <form
        className="flex gap-x-2"
        onSubmit={(e) => {
          e.preventDefault()
          check()
        }}
      >
        <input
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          value={pincode}
          onChange={(e) => {
            setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
            setResult(null)
          }}
          placeholder="Enter pincode"
          aria-label="Pincode"
          className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          data-testid="delivery-check-input"
        />
        <Button type="submit" variant="secondary" isLoading={checking}>
          Check
        </Button>
      </form>
      {result && (
        <Text
          className={`txt-small mt-2 font-medium ${
            result.kind === "yes" ? "text-green-700" : "text-rose-600"
          }`}
          data-testid="delivery-check-result"
        >
          {result.kind === "yes"
            ? `We deliver to ${result.pincode}.`
            : result.kind === "no"
              ? notServiceableMessage(result.pincode)
              : result.message}
        </Text>
      )}
    </div>
  )
}

export default DeliveryCheck
