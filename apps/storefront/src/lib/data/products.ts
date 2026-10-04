"use server"

import { sdk } from "@lib/config"
import { OptionValueIds } from "@lib/util/product-option-filters"
import { sortProducts } from "@lib/util/sort-products"
import { HttpTypes } from "@medusajs/types"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getAuthHeaders, getCacheOptions } from "./cookies"
import { getRegion, retrieveRegion } from "./regions"

type ProductListQueryParams = (HttpTypes.FindParams &
  HttpTypes.StoreProductListParams) & {
  options?: string[]
  option_value_id?: string | string[]
}

/**
 * Product `images[]` (the fallback a thumbnail-less product needs — see
 * Thumbnail's own `thumbnail || images?.[0]?.url` logic) keyed by product
 * id, for merging onto cart/order line items. Deliberately a separate
 * lookup rather than requesting `items.product.images` directly on the
 * cart/order routes: confirmed against Medusa's own query-config source
 * that neither route's allowed-field list includes that path at all (the
 * order route only allows it nested under `items.variant.product.images`,
 * a different path than cart's — relying on either is fragile), so a
 * direct request is silently dropped no matter how it's phrased. The
 * plain products endpoint does support `images` directly, so this fetches
 * it from there instead and the caller merges it in.
 */
export const getProductImagesByIds = async (
  productIds: string[]
): Promise<Record<string, HttpTypes.StoreProductImage[]>> => {
  const uniqueIds = Array.from(new Set(productIds.filter(Boolean)))
  if (!uniqueIds.length) {
    return {}
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<HttpTypes.StoreProductListResponse>(`/store/products`, {
      method: "GET",
      query: {
        id: uniqueIds,
        limit: uniqueIds.length,
        fields: "id,images.url",
      },
      headers,
      cache: "no-store",
    })
    .then(({ products }) => {
      const map: Record<string, HttpTypes.StoreProductImage[]> = {}
      products.forEach((product) => {
        map[product.id] = product.images ?? []
      })
      return map
    })
    .catch(() => ({}))
}

type ItemWithProduct = {
  product_id?: string | null
  product?: { images?: HttpTypes.StoreProductImage[] | null } | null
}

/**
 * Merges each item's product `images[]` in place (see
 * getProductImagesByIds for why this can't just be requested on the
 * cart/order routes directly) — shared by retrieveCart, retrieveOrder,
 * and listOrders so the fix lives in one place.
 */
export const attachProductImages = async <T extends ItemWithProduct>(
  items: T[],
  // Pass a pre-fetched map to batch across multiple item lists in one
  // lookup (see listOrders) instead of fetching per list.
  imagesByProductId?: Record<string, HttpTypes.StoreProductImage[]>
): Promise<T[]> => {
  if (!items.length) {
    return items
  }

  const images =
    imagesByProductId ??
    (await getProductImagesByIds(
      items.map((item) => item.product_id).filter((v): v is string => !!v)
    ))

  return items.map((item) =>
    item.product && item.product_id && images[item.product_id]
      ? { ...item, product: { ...item.product, images: images[item.product_id] } }
      : item
  )
}

export const listProducts = async ({
  pageParam = 1,
  queryParams,
  regionId,
}: {
  pageParam?: number
  queryParams?: ProductListQueryParams
  regionId?: string
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: ProductListQueryParams
}> => {
  const limit = queryParams?.limit || 12
  const _pageParam = Math.max(pageParam, 1)
  const offset = _pageParam === 1 ? 0 : (_pageParam - 1) * limit

  const region = regionId ? await retrieveRegion(regionId) : await getRegion()

  if (!region) {
    return {
      response: { products: [], count: 0 },
      nextPage: null,
    }
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  const next = {
    ...(await getCacheOptions("products")),
  }

  return sdk.client
    .fetch<{ products: HttpTypes.StoreProduct[]; count: number }>(
      `/store/products`,
      {
        method: "GET",
        query: {
          limit,
          offset,
          region_id: region?.id,
          fields:
            "*variants.calculated_price,+variants.inventory_quantity,*variants.images,*variants.options,+metadata,+tags,",
          ...queryParams,
        },
        headers,
        next,
        cache: "force-cache",
      }
    )
    .then(({ products, count }) => {
      const nextPage = count > offset + limit ? pageParam + 1 : null

      return {
        response: {
          products,
          count,
        },
        nextPage: nextPage,
        queryParams,
      }
    })
}

/**
 * This will fetch 100 products to the Next.js cache and sort them based on the sortBy parameter.
 * It will then return the paginated products based on the page and limit parameters.
 */
export const listProductsWithSort = async ({
  page = 0,
  queryParams,
  sortBy = "created_at",
  optionValueIds,
}: {
  page?: number
  queryParams?: ProductListQueryParams
  sortBy?: SortOptions
  optionValueIds?: OptionValueIds
}): Promise<{
  response: { products: HttpTypes.StoreProduct[]; count: number }
  nextPage: number | null
  queryParams?: ProductListQueryParams
}> => {
  const limit = queryParams?.limit || 12
  const optionFilters = Array.from(
    new Set((optionValueIds || []).filter(Boolean))
  )

  const {
    response: { products },
  } = await listProducts({
    pageParam: 0,
    queryParams: {
      ...queryParams,
      ...(optionFilters.length ? { option_value_id: optionFilters } : {}),
      limit: 100,
    },
  })

  const sortedProducts = sortProducts(products, sortBy)

  const pageParam = (page - 1) * limit

  const filteredCount = products.length

  const nextPage = filteredCount > pageParam + limit ? pageParam + limit : null

  const paginatedProducts = sortedProducts.slice(pageParam, pageParam + limit)

  return {
    response: {
      products: paginatedProducts,
      count: filteredCount,
    },
    nextPage,
    queryParams,
  }
}
