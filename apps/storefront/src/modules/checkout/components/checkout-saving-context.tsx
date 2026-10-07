"use client"

import { createContext, useCallback, useContext, useMemo, useState } from "react"

type CheckoutSavingContextValue = {
  isSaving: boolean
  setSaving: (id: string, saving: boolean) => void
}

const CheckoutSavingContext = createContext<CheckoutSavingContextValue>({
  isSaving: false,
  setSaving: () => {},
})

/**
 * Tracks which checkout inputs have a metadata save in flight, so "Place
 * order" can wait for them. Each save is a read-modify-write on the same
 * cart.metadata object, so a click that races an unfinished save could
 * complete the order without that change.
 */
export const CheckoutSavingProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set())

  const setSaving = useCallback((id: string, saving: boolean) => {
    setSavingIds((prev) => {
      const next = new Set(prev)
      if (saving) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ isSaving: savingIds.size > 0, setSaving }),
    [savingIds, setSaving]
  )

  return (
    <CheckoutSavingContext.Provider value={value}>
      {children}
    </CheckoutSavingContext.Provider>
  )
}

export const useCheckoutSaving = () => useContext(CheckoutSavingContext)
