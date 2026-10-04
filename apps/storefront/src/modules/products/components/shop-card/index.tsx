"use client"

import { useState } from "react"
import { Minus, Plus, ShoppingCart } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { addToCart, deleteLineItem, updateLineItem } from "@lib/data/cart"
import { getProductPrice } from "@lib/util/get-product-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import PlaceholderImage from "@modules/common/icons/placeholder-image"
import { Button, Heading, Text } from "@modules/common/components/ui"

/**
 * Generic, reusable product card — takes any single product + region and
 * renders itself from that; nothing here is specific to a particular
 * product or page. Used on the homepage's "Trending Products" row and the
 * full materials catalog grid (`/store`) alike.
 *
 * Always adds the product's first/cheapest variant directly on "Add to
 * Cart" — even for a multi-variant product (e.g. Sand's Type × Load Size
 * combinations) — rather than forcing a "View Options" step first.
 * Deliberate simplification: the customer can still change the line
 * item's variant from the cart or the product page afterward, and a
 * uniform add-to-cart action across every card (confirmed against the
 * design reference) matters more here than guarding against picking the
 * "wrong" variant of a cheap bulk material.
 */
const ShopCard = ({
  product,
  region,
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}) => {
  // lineItemId is null until the customer actually adds this to their cart
  // — that's what switches the card from a plain "Add to Cart" button into
  // the quantity stepper, not local component state alone.
  const [lineItemId, setLineItemId] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  // The input's own text, decoupled from `quantity` while the customer is
  // actively typing (e.g. clearing the field to type "30") — only synced
  // back to `quantity` on blur/Enter, or immediately by the +/- buttons.
  const [draftValue, setDraftValue] = useState("1")
  const [isAdding, setIsAdding] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const variant = product.variants?.[0]
  const { cheapestPrice } = getProductPrice({ product })
  // `thumbnail` is only set if an admin explicitly marks one image as the
  // thumbnail in Admin's media uploader — a plain upload only populates
  // `images[]`. Fall back to the first uploaded image either way, same as
  // the PDP's own Thumbnail component already does.
  const imageUrl = product.thumbnail || product.images?.[0]?.url
  // Some seeded products (e.g. Sand) have no price set on their variant yet
  // — real, pre-existing catalog gap, not a bug. Don't offer to add those.
  const canPurchase = !!variant?.id && !!cheapestPrice

  const handleAddToCart = async () => {
    if (!variant?.id) {
      return
    }

    setIsAdding(true)
    setError(null)

    try {
      const cart = await addToCart({ variantId: variant.id, quantity: 1 })
      const item = cart?.items?.find((i) => i.variant_id === variant.id)

      if (item) {
        setLineItemId(item.id)
        setQuantity(item.quantity)
        setDraftValue(String(item.quantity))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add to cart")
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemove = async () => {
    if (!lineItemId) {
      return
    }

    setIsUpdating(true)
    setError(null)

    try {
      await deleteLineItem(lineItemId)
      setLineItemId(null)
      setQuantity(1)
      setDraftValue("1")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't update cart")
    } finally {
      setIsUpdating(false)
    }
  }

  const commitQuantity = async (nextQuantity: number) => {
    if (!lineItemId || isUpdating || nextQuantity === quantity) {
      setDraftValue(String(quantity))
      return
    }

    if (nextQuantity < 1) {
      await handleRemove()
      return
    }

    const previousQuantity = quantity
    setIsUpdating(true)
    setError(null)
    setQuantity(nextQuantity)
    setDraftValue(String(nextQuantity))

    try {
      await updateLineItem({ lineId: lineItemId, quantity: nextQuantity })
    } catch (err) {
      setQuantity(previousQuantity)
      setDraftValue(String(previousQuantity))
      setError(err instanceof Error ? err.message : "Couldn't update quantity")
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDraftBlur = () => {
    const parsed = parseInt(draftValue, 10)

    if (Number.isNaN(parsed)) {
      setDraftValue(String(quantity))
      return
    }

    commitQuantity(parsed)
  }

  return (
    <div className="border border-ui-border-base rounded-lg overflow-hidden flex flex-col hover:shadow-md transition-shadow">
      <LocalizedClientLink href={`/products/${product.handle}`}>
        <div className="relative aspect-[4/3] bg-ui-bg-subtle">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 20vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlaceholderImage size={24} />
            </div>
          )}
        </div>
      </LocalizedClientLink>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <LocalizedClientLink href={`/products/${product.handle}`}>
          <Heading level="h3" className="text-base leading-snug">
            {product.title}
          </Heading>
        </LocalizedClientLink>
        {cheapestPrice && (
          <Text className="text-brand-600 text-lg font-bold">
            {cheapestPrice.calculated_price}
          </Text>
        )}
        {canPurchase ? (
          <div className="mt-auto">
            {lineItemId ? (
              <div className="flex items-center justify-between border border-ui-border-base rounded-md">
                <button
                  type="button"
                  onClick={() => commitQuantity(quantity - 1)}
                  disabled={isUpdating}
                  className="p-2 hover:bg-gray-50 disabled:opacity-50"
                  aria-label="Decrease quantity"
                >
                  <Minus />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={draftValue}
                  disabled={isUpdating}
                  onChange={(e) =>
                    setDraftValue(e.target.value.replace(/[^0-9]/g, ""))
                  }
                  onBlur={handleDraftBlur}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.currentTarget.blur()
                    }
                  }}
                  aria-label="Quantity"
                  className="w-12 text-center text-sm font-medium border border-gray-300 rounded-md mx-1 py-1 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => commitQuantity(quantity + 1)}
                  disabled={isUpdating}
                  className="p-2 hover:bg-gray-50 disabled:opacity-50"
                  aria-label="Increase quantity"
                >
                  <Plus />
                </button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="small"
                className="w-full"
                isLoading={isAdding}
                onClick={handleAddToCart}
              >
                <ShoppingCart />
                Add to Cart
              </Button>
            )}
          </div>
        ) : (
          <Text className="mt-auto txt-small text-ui-fg-muted">
            Currently unavailable
          </Text>
        )}
        {error && <Text className="txt-small text-rose-600">{error}</Text>}
      </div>
    </div>
  )
}

export default ShopCard
