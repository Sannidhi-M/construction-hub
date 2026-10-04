import { Heading } from "@modules/common/components/ui"

import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import CartTotals from "@modules/common/components/cart-totals"
import Review from "@modules/checkout/components/review"
import { HttpTypes } from "@medusajs/types"

const CheckoutSummary = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart
  customer: HttpTypes.StoreCustomer | null
}) => {
  return (
    <div className="sticky top-6 py-8 small:py-0 small:max-h-[calc(100vh-3rem)]">
      <div className="w-full h-full bg-white rounded-lg border border-gray-200 shadow-sm p-6 small:p-8 flex flex-col small:max-h-[calc(100vh-3rem)]">
        <Heading
          level="h2"
          className="flex flex-row text-2xl-semi text-gray-900 items-baseline mb-6 shrink-0"
        >
          In your Cart
        </Heading>
        <div className="shrink-0">
          <CartTotals totals={cart} />
        </div>
        <div className="flex-1 min-h-0 mt-2 overflow-y-auto overflow-x-hidden no-scrollbar">
          <ItemsPreviewTemplate cart={cart} />
        </div>
        <div className="shrink-0">
          <Review cart={cart} customer={customer} />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
