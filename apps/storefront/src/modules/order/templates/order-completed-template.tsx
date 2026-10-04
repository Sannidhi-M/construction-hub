import { Heading, Text } from "@modules/common/components/ui"
import { cookies as nextCookies } from "next/headers"

import CartTotals from "@modules/common/components/cart-totals"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import UpiPayment from "@modules/checkout/components/upi-payment"
import { HttpTypes } from "@medusajs/types"
import { getCustomerOrderStatus } from "@lib/util/order-status"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
  alreadyConfirmed?: boolean
}

export default async function OrderCompletedTemplate({
  order,
  alreadyConfirmed,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"
  const customerStatus = getCustomerOrderStatus(order)
  const paymentPending = customerStatus === "Payment Pending"

  return (
    <div className="py-6 bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="content-container flex flex-col gap-y-6 w-full">
        {isOnboarding && <OnboardingCta orderId={order.id} />}

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 small:p-10">
          <Heading
            level="h1"
            className="flex flex-col gap-y-2 text-ui-fg-base text-3xl mb-2"
          >
            <span>Thank you!</span>
            <span>Your order was placed successfully.</span>
          </Heading>
        </div>

        {/*
         * Payment always comes first in the markup — stacked on top on
         * mobile, the left (wider) column on desktop — so a customer who
         * still owes payment sees the QR immediately, with no scrolling
         * needed to find it.
         */}
        <div
          className={
            paymentPending
              ? "grid grid-cols-1 small:grid-cols-[1fr_416px] gap-6 items-start"
              : "grid grid-cols-1 gap-6"
          }
        >
          {paymentPending && (
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 small:p-10">
              <UpiPayment order={order} alreadyConfirmed={alreadyConfirmed} />
            </div>
          )}

          <div
            className="flex flex-col gap-4 bg-white rounded-lg border border-gray-200 shadow-sm w-full p-6 small:p-10"
            data-testid="order-complete-container"
          >
            <OrderDetails order={order} />
            {!paymentPending && (
              <Text data-testid="order-customer-status" className="mt-2">
                Status: <span className="font-semibold">{customerStatus}</span>
              </Text>
            )}
            <Heading level="h2" className="flex flex-row text-3xl-regular">
              Summary
            </Heading>
            <Items order={order} />
            <CartTotals totals={order} />
            <ShippingDetails order={order} />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 small:p-10">
          <Help />
        </div>
      </div>
    </div>
  )
}
