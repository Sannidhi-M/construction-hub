"use client"

import { useEffect, useState } from "react"
import { Minus, Plus } from "@medusajs/icons"

/**
 * The "- 3 +" quantity control used on the catalog cards and the product page.
 * `quantity` is the committed value; the text box keeps its own draft while
 * the customer types (so clearing it to type "30" doesn't fire an update per
 * keystroke) and reports a new value through `onChange` on blur/Enter, or
 * straight away from the +/- buttons. The parent decides what a value below
 * 1 means (both callers remove the line).
 */
const QuantityStepper = ({
  quantity,
  onChange,
  disabled,
  className = "",
}: {
  quantity: number
  onChange: (next: number) => void
  disabled?: boolean
  className?: string
}) => {
  const [draft, setDraft] = useState(String(quantity))

  useEffect(() => {
    setDraft(String(quantity))
  }, [quantity])

  const commitDraft = () => {
    const parsed = parseInt(draft, 10)
    if (Number.isNaN(parsed) || parsed === quantity) {
      setDraft(String(quantity))
      return
    }
    onChange(parsed)
  }

  return (
    <div
      className={`flex items-center justify-between border border-ui-border-base rounded-md ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange(quantity - 1)}
        disabled={disabled}
        className="p-2 hover:bg-gray-50 disabled:opacity-50"
        aria-label="Decrease quantity"
      >
        <Minus />
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={draft}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ""))}
        onBlur={commitDraft}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.currentTarget.blur()
          }
        }}
        aria-label="Quantity"
        className="w-12 text-center text-sm font-medium border border-gray-300 rounded-md mx-1 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50"
      />
      <button
        type="button"
        onClick={() => onChange(quantity + 1)}
        disabled={disabled}
        className="p-2 hover:bg-gray-50 disabled:opacity-50"
        aria-label="Increase quantity"
      >
        <Plus />
      </button>
    </div>
  )
}

export default QuantityStepper
