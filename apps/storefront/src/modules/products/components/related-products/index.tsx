import { retrieveCart } from "@lib/data/cart"
import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import ShopCard from "../shop-card"

// Two rows of the four-across catalog grid.
const MAX_RELATED = 8

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
}

export default async function RelatedProducts({
  product,
}: RelatedProductsProps) {
  const region = await getRegion()

  if (!region) {
    return null
  }

  // Same category first (other cement on a cement page), then the rest of the
  // catalog to fill the grid. Nothing here uses collections or tags: no
  // product has either.
  const categoryIds = (product.categories ?? []).map((c) => c.id)

  const fetchProducts = (extra: HttpTypes.StoreProductListParams) =>
    listProducts({
      queryParams: { region_id: region.id, is_giftcard: false, ...extra },
    }).then(({ response }) =>
      response.products.filter((other) => other.id !== product.id)
    )

  const sameCategory = categoryIds.length
    ? await fetchProducts({ category_id: categoryIds, limit: MAX_RELATED })
    : []
  const taken = new Set(sameCategory.map((other) => other.id))
  const others =
    sameCategory.length < MAX_RELATED
      ? await fetchProducts({ limit: MAX_RELATED + 1 + sameCategory.length })
      : []
  const products = [
    ...sameCategory,
    ...others.filter((other) => !taken.has(other.id)),
  ].slice(0, MAX_RELATED)

  if (!products.length) {
    return null
  }

  // Same cards as /store, so a product already in the cart shows its stepper.
  const cart = await retrieveCart()
  const cartItemsByVariant = new Map(
    (cart?.items ?? []).map((item) => [
      item.variant_id,
      { lineItemId: item.id, quantity: item.quantity },
    ])
  )

  return (
    <div className="product-page-constraint">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        You may also like
      </h2>

      <div className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-6">
        {products.map((related) => (
          <ShopCard
            key={related.id}
            product={related}
            region={region}
            cartItem={cartItemsByVariant.get(related.variants?.[0]?.id ?? "")}
          />
        ))}
      </div>
    </div>
  )
}
