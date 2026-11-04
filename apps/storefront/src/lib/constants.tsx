import { CreditCard } from "@medusajs/icons"
import React from "react"

/*
 * Brand/contact identity — single source of truth so a future rebrand or
 * contact-detail change is a one-file edit. Name/logo not finalized yet
 * (placeholder, per the user); phone/location are real.
 */
export const SITE_NAME = "ConstructHub"
export const SITE_PHONE = "+91 7899692136"
export const SITE_PHONE_INTL = "917899692136" // digits only, for wa.me/tel: links
// The floating WhatsApp button's chat link: opens a chat with the business
// number with this message already typed in (the visitor still presses send).
export const WHATSAPP_MESSAGE = `Hi ${SITE_NAME}, I'd like help with my construction.`
export const WHATSAPP_URL = `https://wa.me/${SITE_PHONE_INTL}?text=${encodeURIComponent(
  WHATSAPP_MESSAGE
)}`
export const SITE_LOCATION = "Davangere, Karnataka"
export const SITE_EMAIL = "info@constructhub.in"

/*
 * Grievance Officer — required on the site by the Consumer Protection
 * (E-Commerce) Rules, 2020. Uses the business name as the officer's name
 * (the owner's choice) and the site's own phone/email.
 */
export const GRIEVANCE_OFFICER_NAME = `Grievance Officer, ${SITE_NAME}`
export const GRIEVANCE_HOURS = "Monday to Saturday, 9:00 AM - 5:00 PM"

/*
 * Optional contact details not yet supplied. Read from env (unset = ""), and
 * the /contact page shows each one's card only when it's set — so the page
 * never displays an invented address or opening hours. Set these in
 * apps/storefront/.env.local (and the deployed env) to light the cards up.
 */
export const SITE_ADDRESS = process.env.NEXT_PUBLIC_SITE_ADDRESS ?? "" // full street address
export const SITE_HOURS = process.env.NEXT_PUBLIC_SITE_HOURS ?? "" // e.g. "Mon - Sat: 9:00 AM - 6:00 PM"

/*
 * Business registration details shown in the footer (required disclosures
 * for an e-commerce seller). Same rule as above: unset = hidden, never
 * invented. Set in apps/storefront/.env.local and the deployed env.
 */
export const SITE_LEGAL_NAME = process.env.NEXT_PUBLIC_SITE_LEGAL_NAME ?? "" // registered business name
export const SITE_GSTIN = process.env.NEXT_PUBLIC_SITE_GSTIN ?? ""

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
