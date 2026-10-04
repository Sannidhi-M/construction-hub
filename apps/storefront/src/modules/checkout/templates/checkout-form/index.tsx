import { listCartShippingMethods } from "@lib/data/fulfillment"
import { HttpTypes } from "@medusajs/types"
import Addresses from "@modules/checkout/components/addresses"
import Review from "@modules/checkout/components/review"
import Shipping from "@modules/checkout/components/shipping"

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) {
    return null
  }

  const shippingMethods = await listCartShippingMethods(cart.id)

  if (!shippingMethods) {
    return null
  }

  return (
    <div className="w-full grid grid-cols-1 gap-y-8">
      <Addresses cart={cart} customer={customer} />

      {/*
       * Delivery is auto-assigned right after the address step (see
       * setAddresses in lib/data/cart.ts) — there's only ever one real
       * option (flat-rate, manual delivery), so there's nothing for the
       * customer to choose and no reason to show this section. Only
       * rendered as a fallback if that auto-assignment didn't happen
       * (misconfiguration: no option, or more than one to pick from).
       */}
      {(cart.shipping_methods?.length ?? 0) === 0 && (
        <Shipping cart={cart} availableShippingMethods={shippingMethods} />
      )}

      {/*
       * Single-provider (system/manual UPI) payment flow: there's no payment
       * method choice UI. Review initiates the payment session itself and
       * places the order. A later phase replaces this with the real UPI QR /
       * status UI (see docs/ARCHITECTURE.md §4.2, §2.7).
       */}
      <Review cart={cart} customer={customer} />
    </div>
  )
}
