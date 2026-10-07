import { listCartShippingMethods } from "@lib/data/fulfillment"
import { HttpTypes } from "@medusajs/types"
import Addresses from "@modules/checkout/components/addresses"
import EnsureShippingMethod from "@modules/checkout/components/ensure-shipping-method"
import PaymentMethod from "@modules/checkout/components/payment-method"
import Shipping from "@modules/checkout/components/shipping"

export default async function CheckoutForm({
  cart,
  customer,
  activeStep,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  activeStep?: string
}) {
  if (!cart) {
    return null
  }

  const shippingMethods = await listCartShippingMethods(cart.id)

  if (!shippingMethods) {
    return null
  }

  const hasAddress = !!cart.shipping_address
  const hasShippingMethod = (cart.shipping_methods?.length ?? 0) > 0

  return (
    <div className="w-full grid grid-cols-1 gap-y-6">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 small:p-8">
        <Addresses cart={cart} customer={customer} />
      </div>

      {activeStep !== "address" && hasAddress && hasShippingMethod && (
        <PaymentMethod cart={cart} />
      )}

      {/*
       * Delivery is auto-assigned right after the address step (see
       * setAddresses in lib/data/cart.ts) — there's only ever one real
       * option (flat-rate, manual delivery), so there's nothing for the
       * customer to choose and no reason to show this section. Only
       * rendered as a fallback if that auto-assignment genuinely didn't
       * happen (no option, or more than one to pick from) — gated on
       * `hasAddress` too, since shipping_methods is also empty before the
       * address step has ever run, which isn't a fallback case at all and
       * shouldn't show an empty "Delivery" card.
       */}
      {hasAddress && !hasShippingMethod && (
        <>
          <EnsureShippingMethod cartId={cart.id} />
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 small:p-8">
            <Shipping cart={cart} availableShippingMethods={shippingMethods} />
          </div>
        </>
      )}
    </div>
  )
}
