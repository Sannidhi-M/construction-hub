"use client"

import { addToCart, deleteLineItem, updateLineItem } from "@lib/data/cart"
import { SITE_NAME, SITE_PHONE, SITE_PHONE_TEL, whatsappUrl } from "@lib/constants"
import { getProductPrice } from "@lib/util/get-product-price"
import { convertToLocale } from "@lib/util/money"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import { Button, Text } from "@modules/common/components/ui"
import { Phone } from "@medusajs/icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import WhatsApp from "@modules/common/icons/whatsapp"
import DeliveryCheck from "../delivery-check"
import QuantityStepper from "../quantity-stepper"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { useRouter } from "next/navigation"

// A variant's line in the customer's cart, if it is already there.
type CartLine = { lineItemId: string; quantity: number }

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
  // The customer's cart lines by variant id, so a product already in the cart
  // opens showing its quantity stepper (as on the /store cards).
  cartLines?: Record<string, CartLine>
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt) => {
    if (varopt.option_id) acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

export default function ProductActions({
  product,
  disabled,
  cartLines,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // A single-variant product has nothing to choose, so it starts with its one
  // variant selected (also in the server-rendered HTML, so the page doesn't
  // flash a disabled "Select options" button before it loads).
  const [options, setOptions] = useState<Record<string, string | undefined>>(
    () =>
      product.variants?.length === 1
        ? optionsAsKeymap(product.variants[0].options) ?? {}
        : {}
  )
  const [isAdding, setIsAdding] = useState(false)
  const [lines, setLines] = useState<Record<string, CartLine>>(cartLines ?? {})
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  //check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    router.replace(pathname + "?" + params.toString())
  }, [selectedVariant, isValidVariant])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    // If we don't manage inventory, we can always add to cart
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    // If we allow back orders on the variant, we can add to cart
    if (selectedVariant?.allow_backorder) {
      return true
    }

    // If there is inventory available, we can add to cart
    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    // Otherwise, we can't add to cart
    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)

  const inView = useIntersection(actionsRef, "0px")

  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: selectedVariant?.id,
  })
  // Nothing to buy when the product has no price at all, or the chosen option
  // has none (bulk materials sold by negotiated load): offer a quote instead.
  const priceOnRequest = !cheapestPrice || (!!selectedVariant && !variantPrice)

  const anyInStock = (product.variants ?? []).some(
    (v) =>
      !v.manage_inventory || v.allow_backorder || (v.inventory_quantity ?? 0) > 0
  )

  const line = selectedVariant ? lines[selectedVariant.id] : undefined

  const quoteMessage = `Hi ${SITE_NAME}, I'd like a quote for ${product.title}${
    selectedVariant?.title && (product.variants?.length ?? 0) > 1
      ? ` (${selectedVariant.title})`
      : ""
  }.`
  const quoteHref = whatsappUrl(quoteMessage)
  const bulkHref = whatsappUrl(
    `Hi ${SITE_NAME}, I'd like a bulk price for ${product.title}.`
  )

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)
    setError(null)

    try {
      const result = await addToCart({
        variantId: selectedVariant.id,
        quantity: 1,
      })
      if (result.error) {
        setError(result.error)
        return
      }
      const item = result.cart?.items?.find(
        (i) => i.variant_id === selectedVariant.id
      )
      if (item) {
        setLines((prev) => ({
          ...prev,
          [selectedVariant.id]: { lineItemId: item.id, quantity: item.quantity },
        }))
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't add to cart")
    } finally {
      setIsAdding(false)
    }
  }

  // Quantity stepper: below 1 removes the line, like the /store cards.
  const handleQuantity = async (next: number) => {
    if (!selectedVariant?.id || !line || isUpdating || next === line.quantity) {
      return
    }
    const variantId = selectedVariant.id
    const previous = line

    setIsUpdating(true)
    setError(null)
    try {
      if (next < 1) {
        await deleteLineItem(previous.lineItemId)
        setLines(({ [variantId]: _removed, ...rest }) => rest)
      } else {
        setLines((prev) => ({
          ...prev,
          [variantId]: { ...previous, quantity: next },
        }))
        const result = await updateLineItem({
          lineId: previous.lineItemId,
          quantity: next,
        })
        if (result.error) {
          setLines((prev) => ({ ...prev, [variantId]: previous }))
          setError(result.error)
        }
      }
    } catch (err) {
      setLines((prev) => ({ ...prev, [variantId]: previous }))
      setError(err instanceof Error ? err.message : "Couldn't update cart")
    } finally {
      setIsUpdating(false)
    }
  }

  const mobileCta = priceOnRequest ? "quote" : line ? "incart" : "cart"

  return (
    <>
      <div className="flex flex-col gap-y-5" ref={actionsRef}>
        <div className="flex flex-col gap-y-2">
          <ProductPrice product={product} variant={selectedVariant} />
          {(priceOnRequest ? anyInStock : selectedVariant ? inStock : false) && (
            <span className="inline-flex items-center gap-x-2 font-semibold text-green-700">
              <span className="h-2 w-2 rounded-full bg-green-600" aria-hidden />
              {priceOnRequest ? "Available" : "In stock"}
            </span>
          )}
          {!priceOnRequest && selectedVariant && !inStock && (
            <span className="font-semibold text-rose-600">Out of stock</span>
          )}
        </div>

        {(product.variants?.length ?? 0) > 1 && (
          <div className="flex flex-col gap-y-4">
            {(product.options || []).map((option) => {
              return (
                <div key={option.id}>
                  <OptionSelect
                    option={option}
                    current={options[option.id]}
                    updateOption={setOptionValue}
                    title={option.title ?? ""}
                    data-testid="product-options"
                    disabled={!!disabled || isAdding}
                  />
                </div>
              )
            })}
          </div>
        )}

        {priceOnRequest ? (
          <div className="flex flex-col gap-y-3" data-testid="price-on-request">
            <div className="rounded-lg border border-brand-100 bg-brand-50 p-4">
              <Text className="font-semibold text-gray-900">Price on request</Text>
              <Text className="txt-small text-gray-600 mt-1">
                Tell us what you need and we will send you a quote.
              </Text>
            </div>
            <a
              href={quoteHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center gap-x-2 rounded-rounded bg-[#25D366] font-semibold text-white hover:opacity-90"
              data-testid="quote-whatsapp-button"
            >
              <WhatsApp size={20} />
              Get a quote on WhatsApp
            </a>
            <a
              href={SITE_PHONE_TEL}
              className="flex h-12 items-center justify-center gap-x-2 rounded-rounded border border-gray-300 bg-white font-semibold text-gray-900 hover:bg-gray-50"
              data-testid="quote-call-button"
            >
              <Phone />
              Call {SITE_PHONE}
            </a>
          </div>
        ) : (
          <div className="flex flex-col gap-y-3">
            {line ? (
              <div className="flex flex-col gap-y-2" data-testid="in-cart">
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                  <QuantityStepper
                    className="w-40 shrink-0"
                    quantity={line.quantity}
                    onChange={handleQuantity}
                    disabled={isUpdating || !!disabled}
                  />
                  {variantPrice && (
                    <div className="leading-tight" data-testid="line-total">
                      <span className="txt-small text-ui-fg-subtle block">
                        {line.quantity} &times; {variantPrice.calculated_price}
                      </span>
                      <span className="text-xl font-bold text-gray-900">
                        {convertToLocale({
                          amount:
                            variantPrice.calculated_price_number * line.quantity,
                          currency_code: variantPrice.currency_code,
                        })}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                  <span className="inline-flex items-center gap-x-2 font-semibold text-green-800">
                    <span aria-hidden>&#10003;</span>
                    In your cart
                  </span>
                  <LocalizedClientLink
                    href="/cart"
                    className="font-semibold text-brand-600 underline hover:text-brand-700"
                    data-testid="view-cart-link"
                  >
                    View cart &rarr;
                  </LocalizedClientLink>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleAddToCart}
                disabled={
                  !inStock ||
                  !selectedVariant ||
                  !!disabled ||
                  isAdding ||
                  !isValidVariant
                }
                variant="primary"
                className="w-full h-12"
                isLoading={isAdding}
                data-testid="add-product-button"
              >
                {!selectedVariant
                  ? "Select options"
                  : !inStock || !isValidVariant
                  ? "Out of stock"
                  : "Add to cart"}
              </Button>
            )}
            {error && <Text className="txt-small text-rose-600">{error}</Text>}
          </div>
        )}

        <DeliveryCheck />

        <ul className="flex flex-col gap-y-2 txt-small text-ui-fg-subtle">
          <li className="flex gap-x-2">
            <span className="text-green-700" aria-hidden>&#10003;</span>
            Same-day delivery available
          </li>
          <li className="flex gap-x-2">
            <span className="text-green-700" aria-hidden>&#10003;</span>
            Pay by UPI or cash on delivery
          </li>
        </ul>

        {!priceOnRequest && (
          <Text className="txt-small text-ui-fg-subtle">
            Buying in bulk?{" "}
            <a
              href={bulkHref}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-600 underline"
            >
              Ask for a bulk price
            </a>
          </Text>
        )}

        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
          cta={mobileCta}
          quoteHref={quoteHref}
        />
      </div>
    </>
  )
}
