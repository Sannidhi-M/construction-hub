import { retrieveCart } from "@lib/data/cart"
import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import ProductActions from "@modules/products/components/product-actions"

/**
 * Fetches real time pricing for a product and renders the product actions component.
 */
export default async function ProductActionsWrapper({
  id,
  region,
}: {
  id: string
  region: HttpTypes.StoreRegion
}) {
  const [product, cart] = await Promise.all([
    listProducts({
      queryParams: { id: [id] },
      regionId: region.id,
    }).then(({ response }) => response.products[0]),
    retrieveCart(),
  ])

  if (!product) {
    return null
  }

  // Lines already in the cart, so the page opens with the quantity stepper
  // for a product the customer has added (same idea as the /store cards).
  const cartLines = Object.fromEntries(
    (cart?.items ?? [])
      .filter((item) => !!item.variant_id)
      .map((item) => [
        item.variant_id as string,
        { lineItemId: item.id, quantity: item.quantity },
      ])
  )

  return <ProductActions product={product} region={region} cartLines={cartLines} />
}
