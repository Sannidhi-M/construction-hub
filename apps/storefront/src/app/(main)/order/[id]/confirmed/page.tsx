import { retrieveOrder, retrieveOrderCheckoutMetadata } from "@lib/data/orders"
import OrderCompletedTemplate from "@modules/order/templates/order-completed-template"
import { Metadata } from "next"
import { notFound } from "next/navigation"

type Props = {
  params: Promise<{ id: string }>
}
export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "You purchase was successful",
}

export default async function OrderConfirmedPage(props: Props) {
  const params = await props.params
  const order = await retrieveOrder(params.id).catch(() => null)

  if (!order) {
    return notFound()
  }

  const checkoutMetadata = await retrieveOrderCheckoutMetadata(order.id)

  return (
    <OrderCompletedTemplate
      order={order}
      alreadyConfirmed={checkoutMetadata.paymentCustomerConfirmed}
      paymentMethod={checkoutMetadata.paymentMethod}
      requestedDeliveryDate={checkoutMetadata.requestedDeliveryDate}
    />
  )
}
