"use client"

import { XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import OrderSummary from "@modules/order/components/order-summary"
import ShippingDetails from "@modules/order/components/shipping-details"
import UpiPayment from "@modules/checkout/components/upi-payment"
import { Text } from "@modules/common/components/ui"
import { convertToLocale } from "@lib/util/money"
import { getCustomerOrderStatus, isAwaitingPayment } from "@lib/util/order-status"
import React from "react"

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
  alreadyConfirmed?: boolean
  paymentMethod?: "upi" | "cod"
  requestedDeliveryDate?: string
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
  alreadyConfirmed,
  paymentMethod,
  requestedDeliveryDate,
}) => {
  const customerStatus = getCustomerOrderStatus(order, alreadyConfirmed, paymentMethod)

  return (
    <div className="flex flex-col justify-center gap-y-4">
      <div className="flex gap-2 justify-between items-center">
        <h1 className="text-2xl-semi">Order details</h1>
        <LocalizedClientLink
          href="/account/orders"
          className="flex gap-2 items-center text-ui-fg-subtle hover:text-ui-fg-base"
          data-testid="back-to-overview-button"
        >
          <XMark /> Back to overview
        </LocalizedClientLink>
      </div>
      <div
        className="flex flex-col gap-4 h-full bg-white w-full"
        data-testid="order-details-container"
      >
        <OrderDetails order={order} showStatus customerStatus={customerStatus} />
        {paymentMethod === "cod" && (
          <Text className="text-ui-fg-subtle" data-testid="order-cod-note">
            Cash on Delivery — pay {convertToLocale({ amount: order.total ?? 0, currency_code: order.currency_code })} when your order arrives.
          </Text>
        )}
        {isAwaitingPayment(customerStatus) && (
          <div className="border-t border-gray-200 pt-4">
            <UpiPayment order={order} alreadyConfirmed={alreadyConfirmed} />
          </div>
        )}
        <Items order={order} />
        <ShippingDetails order={order} requestedDeliveryDate={requestedDeliveryDate} />
        <OrderSummary order={order} />
        <Help />
      </div>
    </div>
  )
}

export default OrderDetailsTemplate
