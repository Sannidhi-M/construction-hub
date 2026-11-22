"use client"

import { XMark } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import OrderTracker from "@modules/order/components/order-tracker"
import OrderSummary from "@modules/order/components/order-summary"
import ReportProblem from "@modules/order/components/report-problem"
import ShippingDetails from "@modules/order/components/shipping-details"
import UpiPayment from "@modules/checkout/components/upi-payment"
import { confirmPaymentSubmitted } from "@lib/data/orders"
import { Heading, Text } from "@modules/common/components/ui"
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
        <h1 className="text-2xl-semi whitespace-nowrap">Order details</h1>
        <LocalizedClientLink
          href="/account/orders"
          className="flex shrink-0 gap-2 items-center whitespace-nowrap text-ui-fg-subtle hover:text-ui-fg-base"
          data-testid="back-to-overview-button"
        >
          <XMark />
          <span className="small:hidden">Back</span>
          <span className="hidden small:inline">Back to overview</span>
        </LocalizedClientLink>
      </div>
      <div
        className="flex flex-col gap-4 h-full bg-white w-full"
        data-testid="order-details-container"
      >
        <OrderDetails
          order={order}
          showStatus
          customerStatus={customerStatus}
          requestedDeliveryDate={requestedDeliveryDate}
        />
        <div className="border-t border-gray-200 pt-6">
          <Heading level="h2" className="text-3xl-regular mb-4">
            Order status
          </Heading>
          <OrderTracker status={customerStatus} paymentMethod={paymentMethod} />
        </div>
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
        {isAwaitingPayment(customerStatus) && (
          <div className="border-t border-gray-200 pt-4">
            <UpiPayment
              amount={Number(order.total ?? 0)}
              currencyCode={order.currency_code}
              referenceLabel={`Order #${order.display_id}`}
              transactionNote={`Order ${order.display_id}`}
              alreadyConfirmed={alreadyConfirmed}
              onConfirmPaid={() => confirmPaymentSubmitted(order.id)}
              viewHref={`/account/orders/details/${order.id}`}
              viewLabel="View Order"
            />
          </div>
        )}
        <Items order={order} />
        <ShippingDetails order={order} />
        <OrderSummary order={order} />
        {customerStatus === "Delivered" && order.display_id != null && (
          <ReportProblem displayId={order.display_id} />
        )}
        <Help />
      </div>
    </div>
  )
}

export default OrderDetailsTemplate
