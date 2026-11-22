import { clx } from "@modules/common/components/ui"

import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

/**
 * The price block. A product (or the selected option) with no price set shows
 * "Price on request" — the buy box beside it offers a quote instead — rather
 * than an empty or loading-looking space.
 */
export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return (
      <span
        className="text-2xl font-bold text-gray-900"
        data-testid="product-price"
      >
        Price on request
      </span>
    )
  }

  return (
    <div className="flex flex-col text-ui-fg-base">
      <span className="flex items-baseline gap-x-2">
        {!variant && <span className="text-ui-fg-subtle">From</span>}
        <span
          className={clx("text-3xl font-bold", {
            "text-brand-600": selectedPrice.price_type === "sale",
          })}
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {selectedPrice.calculated_price}
        </span>
        {selectedPrice.price_type === "sale" && (
          <>
            <span
              className="text-ui-fg-subtle line-through"
              data-testid="original-product-price"
              data-value={selectedPrice.original_price_number}
            >
              {selectedPrice.original_price}
            </span>
            <span className="text-brand-600 font-semibold">
              -{selectedPrice.percentage_diff}%
            </span>
          </>
        )}
      </span>
      <span className="txt-small text-ui-fg-subtle">Price includes taxes</span>
    </div>
  )
}
