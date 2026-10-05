import { retrieveCart } from "@lib/data/cart"
import { listProductsWithSort } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { OptionValueIds } from "@lib/util/product-option-filters"
import ShopCard from "@modules/products/components/shop-card"
import { Pagination } from "@modules/store/components/pagination"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

const PRODUCT_LIMIT = 12

type PaginatedProductsParams = {
  limit: number
  collection_id?: string[]
  category_id?: string[]
  id?: string[]
  order?: string
  q?: string
}

export default async function PaginatedProducts({
  sortBy,
  page,
  collectionId,
  categoryId,
  productsIds,
  optionValueIds,
  q,
}: {
  sortBy?: SortOptions
  page: number
  collectionId?: string
  categoryId?: string
  productsIds?: string[]
  optionValueIds?: OptionValueIds
  q?: string
}) {
  const queryParams: PaginatedProductsParams = {
    limit: 12,
  }

  if (collectionId) {
    queryParams["collection_id"] = [collectionId]
  }

  if (categoryId) {
    queryParams["category_id"] = [categoryId]
  }

  if (productsIds) {
    queryParams["id"] = productsIds
  }

  if (sortBy === "created_at") {
    queryParams["order"] = "created_at"
  }

  if (q) {
    queryParams["q"] = q
  }

  const region = await getRegion()

  if (!region) {
    return null
  }

  const {
    response: { products, count },
  } = await listProductsWithSort({
    page,
    queryParams,
    sortBy,
    optionValueIds,
  })

  const totalPages = Math.ceil(count / PRODUCT_LIMIT)

  if (!products.length) {
    return (
      <p className="text-ui-fg-subtle txt-medium py-16 text-center">
        No materials found.
      </p>
    )
  }

  const cart = await retrieveCart()
  const cartItemsByVariant = new Map(
    (cart?.items ?? []).map((item) => [
      item.variant_id,
      { lineItemId: item.id, quantity: item.quantity },
    ])
  )

  return (
    <>
      <div
        className="grid grid-cols-2 w-full small:grid-cols-3 medium:grid-cols-4 gap-6"
        data-testid="products-list"
      >
        {products.map((p) => (
          <ShopCard
            key={p.id}
            product={p}
            region={region}
            cartItem={cartItemsByVariant.get(p.variants?.[0]?.id ?? "")}
          />
        ))}
      </div>
      {totalPages > 1 && (
        <Pagination
          data-testid="product-pagination"
          page={page}
          totalPages={totalPages}
        />
      )}
    </>
  )
}
