"use server"

// Single-locale storefront (Karnataka/India, INR) — see docs/ARCHITECTURE.md
// §5. There is no locale switcher; this hardcoded value is only sent as the
// `x-medusa-locale` header so backend content endpoints that expect one keep
// working.
const STOREFRONT_LOCALE = "en-IN"

export const getLocale = async (): Promise<string> => {
  return STOREFRONT_LOCALE
}
