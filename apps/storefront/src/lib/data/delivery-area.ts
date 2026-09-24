"use server"

import { sdk } from "@lib/config"

/**
 * Checks whether a pincode is within the business's serviceable delivery
 * area. Throws on a network/server error (distinct from a deliberate
 * "not serviceable" result) so callers can tell the two apart.
 */
export async function checkPincodeServiceable(pincode: string): Promise<boolean> {
  return sdk.client
    .fetch<{ serviceable: boolean }>(`/store/delivery-area/check`, {
      method: "GET",
      query: { pincode },
    })
    .then(({ serviceable }) => serviceable)
}
