import { Metadata } from "next"

import OrderOverview from "@modules/account/components/order-overview"
import LabourBookingOverview from "@modules/account/components/labour-booking-overview"
import QuoteRequestOverview from "@modules/account/components/quote-request-overview"
import OrdersTabs, { OrdersTab } from "@modules/account/components/orders-tabs"
import { notFound } from "next/navigation"
import { listOrders } from "@lib/data/orders"
import { listLabourBookings } from "@lib/data/labour-bookings"
import { listLabourServices } from "@lib/data/labour-services"
import { listQuoteRequests } from "@lib/data/quote-requests"

export const metadata: Metadata = {
  title: "Orders & Requests",
  description: "Overview of your previous orders, bookings and quote requests.",
}

type Props = {
  searchParams: Promise<{ tab?: string }>
}

export default async function Orders(props: Props) {
  const { tab } = await props.searchParams
  const activeTab: OrdersTab =
    tab === "labour" || tab === "engineering" ? tab : "materials"

  // Only the active tab's data is fetched.
  const content =
    activeTab === "labour"
      ? await renderLabourBookings()
      : activeTab === "engineering"
        ? await renderQuoteRequests()
        : await renderMaterialOrders()

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-2">
        <h1 className="text-2xl-semi text-gray-900">My Orders &amp; Requests</h1>
        <p className="text-base-regular text-gray-600">
          View your previous orders, bookings and quote requests, and their status.
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
  const [bookings, services] = await Promise.all([
    listLabourBookings(),
    listLabourServices(),
  ])

  if (!bookings) {
    notFound()
  }

  const serviceImages = Object.fromEntries(
    services.map((service) => [service.slug, service.imageUrl])
  )

  return <LabourBookingOverview bookings={bookings} serviceImages={serviceImages} />
}

async function renderQuoteRequests() {
  const quoteRequests = await listQuoteRequests()

  if (!quoteRequests) {
    notFound()
  }

  return <QuoteRequestOverview quoteRequests={quoteRequests} />
}
