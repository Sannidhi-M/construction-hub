import "server-only"

import { revalidateTag } from "next/cache"
import { HttpTypes } from "@medusajs/types"
import { sdk } from "@lib/config"
import { getAuthHeaders, getCacheTag } from "./cookies"

/**
 * Remembering the addresses a customer has used, so they pick from "Manage
 * addresses" instead of retyping one for every order or booking.
 *
 * Deliberately NOT a "use server" module: anything exported from one of those
 * becomes a function the browser can call directly, and this should only ever
 * run server-side, as a step of placing an order (cart.ts) or creating a
 * booking (labour-bookings.ts).
 */

export type AddressToSave = {
  first_name?: string | null
  last_name?: string | null
  company?: string | null // the "Landmark" field
  address_1: string
  address_2?: string | null
  city: string
  province?: string | null
  postal_code: string
  country_code: string
  phone?: string | null
}

// Two addresses count as the same place when their street line and pincode
// match, ignoring case, punctuation and spacing — so "#100/16, 9th Cross" and
// "# 100/16 9th cross" don't become two saved addresses. City and landmark are
// left out on purpose: the same house described with a different landmark is
// still the same house.
const addressKey = (address: {
  address_1?: string | null
  postal_code?: string | null
}) =>
  `${(address.address_1 ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()}|${(
    address.postal_code ?? ""
  ).replace(/\s+/g, "")}`

/**
 * Adds `address` to the signed-in customer's saved addresses unless it's
 * already there.
 *
 * - Does nothing for a guest, or an address with no street line / pincode.
 * - The customer's *first* saved address becomes their default shipping and
 *   billing address (so the profile's billing address isn't left empty after
 *   their first order); every later one is added as a non-default, so this
 *   never changes a default the customer chose themselves.
 * - Never throws. Remembering an address is a convenience; a failure here
 *   must not fail the order or booking that triggered it.
 */
export const saveAddressIfNew = async (address: AddressToSave): Promise<void> => {
  try {
    if (!address.address_1?.trim() || !address.postal_code?.trim()) {
      return
    }

    const authHeaders = await getAuthHeaders()
    if (!("authorization" in authHeaders)) {
      return
    }

    // A fresh read, not retrieveCustomer(): that one is cached, and a stale
    // address list would let a duplicate through.
    const { customer } = await sdk.client.fetch<{
      customer: HttpTypes.StoreCustomer
    }>("/store/customers/me", {
      method: "GET",
      query: { fields: "*addresses" },
      headers: authHeaders,
      cache: "no-store",
    })

    const existing = customer.addresses ?? []
    const key = addressKey(address)
    if (existing.some((saved) => addressKey(saved) === key)) {
      return
    }

    const isFirstAddress = existing.length === 0

    await sdk.store.customer.createAddress(
      {
        first_name: address.first_name || customer.first_name || "",
        last_name: address.last_name || customer.last_name || "",
        company: address.company ?? "",
        address_1: address.address_1.trim(),
        address_2: address.address_2 ?? "",
        city: address.city,
        province: address.province ?? "",
        postal_code: address.postal_code.trim(),
        country_code: address.country_code,
        phone: address.phone || customer.phone || "",
        is_default_shipping: isFirstAddress,
        is_default_billing: isFirstAddress,
      },
      {},
      authHeaders
    )

    // The saved list (and the checkout / booking pickers) read the cached
    // customer record — refresh it so the new address shows up straight away.
    revalidateTag(await getCacheTag("customers"))
  } catch (error) {
    console.error("Couldn't save the address to the customer's address book:", error)
  }
}
