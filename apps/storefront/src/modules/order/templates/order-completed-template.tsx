import { Heading, Text } from "@modules/common/components/ui"
import { CheckCircleSolid } from "@medusajs/icons"
import { cookies as nextCookies } from "next/headers"

import CartTotals from "@modules/common/components/cart-totals"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import UpiPayment from "@modules/checkout/components/upi-payment"
import { HttpTypes } from "@medusajs/types"
import { getCustomerOrderStatus, isAwaitingPayment } from "@lib/util/order-status"
import { convertToLocale } from "@lib/util/money"

type OrderCompletedTemplateProps = {
  order: HttpTypes.StoreOrder
  alreadyConfirmed?: boolean
  paymentMethod?: "upi" | "cod"
  requestedDeliveryDate?: string
}

export default async function OrderCompletedTemplate({
  order,
  alreadyConfirmed,
  paymentMethod,
  requestedDeliveryDate,
}: OrderCompletedTemplateProps) {
  const cookies = await nextCookies()

  const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"
  const customerStatus = getCustomerOrderStatus(order, alreadyConfirmed, paymentMethod)
  const paymentPending = isAwaitingPayment(customerStatus)

  return (
    <div className="py-6 bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="content-container flex flex-col gap-y-6 w-full">
        {isOnboarding && <OnboardingCta orderId={order.id} />}

        <div className="bg-brand-50 border border-brand-100 rounded-lg p-6 small:p-8 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-white mb-3">
            <CheckCircleSolid className="w-6 h-6" />
          </div>
          <Heading level="h1" className="text-2xl small:text-3xl font-bold text-gray-900">
            Thank you!
          </Heading>
          <Text className="text-gray-600 mt-1">
            Your order was placed successfully.
          </Text>
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
            {paymentMethod === "cod" && (
              <Text className="mt-2 text-gray-600" data-testid="order-cod-note">
                Cash on Delivery — pay{" "}
                {convertToLocale({
                  amount: order.total ?? 0,
                  currency_code: order.currency_code,
                })}{" "}
                when your order arrives.
              </Text>
            )}
            <Heading level="h2" className="flex flex-row text-3xl-regular">
              Summary
            </Heading>
            <Items order={order} />
            <CartTotals totals={order} />
            <ShippingDetails order={order} requestedDeliveryDate={requestedDeliveryDate} />
          </div>
        </div>
      </div>
    </div>
  )
}
