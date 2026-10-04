import { HttpTypes } from "@medusajs/types"
import { Text } from "@modules/common/components/ui"
import { CustomerOrderStatus, getCustomerOrderStatus } from "@lib/util/order-status"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
  // Pass this when the caller already knows the status (e.g. it also
  // needed the "I've Paid" flag to compute it) — otherwise this falls
  // back to computing it without that flag, which can't tell "Payment
  // Pending" apart from "Payment Verification Pending".
  customerStatus?: CustomerOrderStatus
}

const OrderDetails = ({ order, showStatus, customerStatus }: OrderDetailsProps) => {
  return (
    <div>
      <Text>
        We have sent the order confirmation details to{" "}
        <span
          className="text-ui-fg-medium-plus font-semibold"
          data-testid="order-email"
        >
          {order.email}
        </span>
        .
      </Text>
      <Text className="mt-2">
        Order date:{" "}
        <span data-testid="order-date">
          {new Date(order.created_at).toDateString()}
        </span>
      </Text>
      <Text className="mt-2 text-ui-fg-interactive">
        Order number: <span data-testid="order-id">{order.display_id}</span>
      </Text>

      <div className="flex items-center text-compact-small gap-x-4 mt-4">
        {showStatus && (
          <Text>
            Status:{" "}
            <span className="text-ui-fg-subtle" data-testid="order-status">
              {customerStatus ?? getCustomerOrderStatus(order)}
            </span>
          </Text>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
