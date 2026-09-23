"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

// Single-region storefront (Karnataka/India, INR) — see docs/ARCHITECTURE.md
// §5. There is exactly one region configured on the backend, so we resolve it
// directly instead of building a country-code -> region map.

export const listRegions = async () => {
  const next = {
    ...(await getCacheOptions("regions")),
  }

  return await sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ regions }) => regions)
}

export const retrieveRegion = async (id: string) => {
  const next = {
    ...(await getCacheOptions(["regions", id].join("-"))),
  }

  return await sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ region }) => region)
}

let cachedRegion: HttpTypes.StoreRegion | null | undefined

/**
 * Resolves the storefront's single region. Kept as an async lookup (rather
 * than a hardcoded constant) so it still reflects whatever region is
 * configured in Medusa Admin, without requiring a country-code argument.
 */
export const getRegion = async () => {
  if (cachedRegion !== undefined) {
    return cachedRegion
  }

  const regions = await listRegions()
  cachedRegion = regions?.[0] ?? null

  return cachedRegion
}
