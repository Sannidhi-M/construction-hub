import { HttpTypes } from "@medusajs/types"
import { Badge, Text } from "@modules/common/components/ui"
import {
  CustomerOrderStatus,
  getCustomerOrderStatus,
  STATUS_BADGE_COLOR,
} from "@lib/util/order-status"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
  // Pass this when the caller already knows the status (e.g. it also
  // needed the "I've Paid" flag to compute it) — otherwise this falls
  // back to computing it without that flag, which can't tell "Payment
  // Pending" apart from "Payment Verification Pending".
  customerStatus?: CustomerOrderStatus
  requestedDeliveryDate?: string
}

const Field = ({
  label,
  value,
  testId,
  highlight,
}: {
  label: string
  value: string
  testId?: string
  highlight?: boolean
}) => (
  <Text className="break-words">
    <span className="txt-small text-ui-fg-subtle">{label}: </span>
    <span
      className={highlight ? "font-semibold text-brand-600" : "font-semibold text-gray-900"}
      data-testid={testId}
    >
      {value}
    </span>
  </Text>
)

const OrderDetails = ({
  order,
  showStatus,
  customerStatus,
  requestedDeliveryDate,
}: OrderDetailsProps) => {
  const status = customerStatus ?? getCustomerOrderStatus(order)

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 small:p-6">
      <div className="flex flex-wrap items-start justify-between gap-y-3">
        <div className="flex flex-col gap-y-2">
          <Field
            label="Order number"
            value={`#${order.display_id}`}
            testId="order-id"
            highlight
          />
          <Field
            label="Order date"
            value={new Date(order.created_at).toDateString()}
            testId="order-date"
          />
          {requestedDeliveryDate && (
            <Field
              label="Delivery date"
              value={new Date(`${requestedDeliveryDate}T00:00:00`).toDateString()}
              testId="order-delivery-date"
            />
          )}
        </div>
        {showStatus && (
          <Badge color={STATUS_BADGE_COLOR[status]} data-testid="order-status">
            {status}
          </Badge>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
