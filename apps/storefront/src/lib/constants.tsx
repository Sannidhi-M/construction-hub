import { CreditCard } from "@medusajs/icons"
import React from "react"

/*
 * Map of payment provider_id to their title and icon. v1 only uses Medusa's
 * built-in system payment provider (pp_system_default) — see
 * docs/ARCHITECTURE.md §2.4. A later phase adds the real UPI provider entry.
 */
export const paymentInfoMap: Record<
  string,
  { title: string; icon: React.JSX.Element }
> = {
  pp_system_default: {
    title: "Manual Payment",
    icon: <CreditCard />,
  },
}

export const isManual = (providerId?: string) => {
  return providerId?.startsWith("pp_system_default")
}

// Add currencies that don't need to be divided by 100
export const noDivisionCurrencies = [
  "krw",
  "jpy",
  "vnd",
  "clp",
  "pyg",
  "xaf",
  "xof",
  "bif",
  "djf",
  "gnf",
  "kmf",
  "mga",
  "rwf",
  "xpf",
  "htg",
  "vuv",
  "xag",
  "xdr",
  "xau",
]
