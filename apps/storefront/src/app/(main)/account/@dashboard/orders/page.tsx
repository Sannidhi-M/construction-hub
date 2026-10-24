import { Metadata } from "next"

import OrderOverview from "@modules/account/components/order-overview"
import LabourBookingOverview from "@modules/account/components/labour-booking-overview"
import OrdersTabs, { OrdersTab } from "@modules/account/components/orders-tabs"
import { notFound } from "next/navigation"
import { listOrders } from "@lib/data/orders"
import { listLabourBookings } from "@lib/data/labour-bookings"

export const metadata: Metadata = {
  title: "Orders",
  description: "Overview of your previous orders.",
}

type Props = {
  searchParams: Promise<{ tab?: string }>
}

export default async function Orders(props: Props) {
  const { tab } = await props.searchParams
  const activeTab: OrdersTab = tab === "labour" ? "labour" : "materials"

  // Only the active tab's data is fetched.
  const content =
    activeTab === "labour"
      ? await renderLabourBookings()
      : await renderMaterialOrders()

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-2">
        <h1 className="text-2xl-semi text-gray-900">My Orders</h1>
        <p className="text-base-regular text-gray-600">
          View your previous orders and bookings, and their status.
        </p>
      </div>
      <OrdersTabs active={activeTab} />
      <div>{content}</div>
    </div>
  )
}

async function renderMaterialOrders() {
  const orders = await listOrders()

  if (!orders) {
    notFound()
  }

  return <OrderOverview orders={orders} />
}

async function renderLabourBookings() {
  const bookings = await listLabourBookings()

  if (!bookings) {
    notFound()
  }

  return <LabourBookingOverview bookings={bookings} />
}
