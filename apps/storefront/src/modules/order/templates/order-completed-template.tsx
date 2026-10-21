import { Heading, Text } from "@modules/common/components/ui"
import { CheckCircleSolid } from "@medusajs/icons"
import { cookies as nextCookies } from "next/headers"

import CartTotals from "@modules/common/components/cart-totals"
import Items from "@modules/order/components/items"
import OnboardingCta from "@modules/order/components/onboarding-cta"
import OrderDetails from "@modules/order/components/order-details"
import ShippingDetails from "@modules/order/components/shipping-details"
import UpiPayment from "@modules/checkout/components/upi-payment"
import { confirmPaymentSubmitted } from "@lib/data/orders"
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
          <Text className="text-gray-600 mt-1">
            Our team will call you shortly to confirm the order before it's
            out for delivery.
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
              <UpiPayment
                amount={Number(order.total ?? 0)}
                currencyCode={order.currency_code}
                referenceLabel={`Order #${order.display_id}`}
                transactionNote={`Order ${order.display_id}`}
                alreadyConfirmed={alreadyConfirmed}
                onConfirmPaid={confirmPaymentSubmitted.bind(null, order.id)}
                viewHref={`/account/orders/details/${order.id}`}
                viewLabel="View Order"
              />
            </div>
          )}

          <div
            className="flex flex-col gap-4 bg-white rounded-lg border border-gray-200 shadow-sm w-full p-6 small:p-10"
            data-testid="order-complete-container"
          >
            <OrderDetails
              order={order}
              showStatus={!paymentPending}
              customerStatus={customerStatus}
              requestedDeliveryDate={requestedDeliveryDate}
            />
            {paymentMethod === "cod" && (
              <div
                className="flex items-center gap-x-2 bg-brand-50 border border-brand-100 rounded-md px-4 py-3"
                data-testid="order-cod-note"
              >
                <Text className="text-brand-700 txt-medium">
                  Cash on Delivery — pay{" "}
                  <span className="font-semibold">
                    {convertToLocale({
                      amount: order.total ?? 0,
                      currency_code: order.currency_code,
                    })}
                  </span>{" "}
                  when your order arrives.
                </Text>
              </div>
            )}
            <div className="border-t border-gray-200 pt-6 mt-2">
              <Heading level="h2" className="flex flex-row text-3xl-regular mb-4">
                Summary
              </Heading>
              <Items order={order} />
              <CartTotals totals={order} />
            </div>
            <div className="border-t border-gray-200 pt-2">
              <ShippingDetails order={order} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
