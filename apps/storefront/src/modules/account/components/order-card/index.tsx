import { Badge } from "@modules/common/components/ui"
import { ChevronRight } from "@medusajs/icons"

import Thumbnail from "@modules/products/components/thumbnail"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import {
  getCustomerOrderStatus,
  STATUS_BADGE_COLOR,
} from "@lib/util/order-status"

type OrderCardProps = {
  order: HttpTypes.StoreOrder
}

// Compact list row (thumbnail · title · price/status), the whole row being
// the link to the order's detail page — a long list of orders stays
// scannable instead of each order filling a screen.
const OrderCard = ({ order }: OrderCardProps) => {
  const customerStatus = getCustomerOrderStatus(
    order,
    !!order.metadata?.payment_customer_confirmed,
    order.metadata?.payment_method === "cod" ? "cod" : undefined
  )

  const [firstItem, ...otherItems] = order.items ?? []

  return (
    <LocalizedClientLink
      href={`/account/orders/details/${order.id}`}
      className="group flex items-center gap-x-4 small:gap-x-6 bg-white border border-gray-200 rounded-lg p-3 small:p-4 hover:border-gray-300 hover:shadow-md transition-shadow"
      data-testid="order-card"
    >
      <Thumbnail
        thumbnail={firstItem?.thumbnail}
        images={firstItem?.product?.images}
        size="square"
        className="w-16 small:w-20 shrink-0 p-0"
      />

      <div className="flex flex-1 min-w-0 flex-col gap-y-1">
        <span
          className="text-base-semi text-gray-900 truncate"
          data-testid="item-title"
        >
          {firstItem?.title ?? "Order"}
        </span>
        <span className="text-small-regular text-ui-fg-subtle">
          {otherItems.length > 0 ? (
            `+ ${otherItems.length} more ${otherItems.length > 1 ? "items" : "item"}`
          ) : (
            <>
              Qty: <span data-testid="item-quantity">{firstItem?.quantity ?? 0}</span>
            </>
          )}
        </span>
        <span className="text-small-regular text-ui-fg-subtle">
          Order #<span data-testid="order-display-id">{order.display_id}</span>
          {" · "}
          <span data-testid="order-created-at">
            {new Date(order.created_at).toDateString()}
          </span>
        </span>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-y-2">
        <span className="text-base-semi text-gray-900" data-testid="order-amount">
          {convertToLocale({
            amount: order.total,
            currency_code: order.currency_code,
          })}
        </span>
        <Badge
          color={STATUS_BADGE_COLOR[customerStatus]}
          data-testid="order-customer-status"
        >
          {customerStatus}
        </Badge>
      </div>

      <ChevronRight
        className="hidden small:block shrink-0 text-gray-400 group-hover:text-gray-600"
        data-testid="order-details-link"
      />
    </LocalizedClientLink>
  )
}

export default OrderCard
