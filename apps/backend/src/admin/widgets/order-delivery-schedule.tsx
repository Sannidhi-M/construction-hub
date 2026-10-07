import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminOrder } from "@medusajs/types"
import { Container, Heading, Text } from "@medusajs/ui"

const OrderDeliveryScheduleWidget = ({
  data: order,
}: DetailWidgetProps<AdminOrder>) => {
  const requestedDate = order.metadata?.requested_delivery_date as
    | string
    | undefined

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Delivery Date</Heading>
      </div>
      <div className="px-6 py-4">
        <Text size="small" className="text-ui-fg-subtle">
          {requestedDate
            ? `Customer requested delivery on ${requestedDate}.`
            : "No specific date requested — deliver as soon as possible."}
        </Text>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details",
})

export default OrderDeliveryScheduleWidget
