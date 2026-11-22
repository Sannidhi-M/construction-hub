import { useEffect, useState } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Wrench } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Heading,
  Select,
  Table,
  Text,
  toast,
} from "@medusajs/ui"

type LabourBooking = {
  id: string
  service_name: string
  rate_type: "day" | "hour"
  rate_amount: number
  start_date: string | null
  end_date: string | null
  scheduled_time: string | null
  duration_hours: number | null
  num_workers: number
  address_1: string
  landmark: string | null
  city: string
  postal_code: string
  phone: string
  email: string | null
  payment_method: "upi" | "cod"
  payment_customer_confirmed: boolean
  payment_received: boolean
  status: "requested" | "confirmed" | "completed" | "cancelled"
  created_at: string
}

const STATUS_COLOR: Record<LabourBooking["status"], "orange" | "blue" | "green" | "red"> = {
  requested: "orange",
  confirmed: "blue",
  completed: "green",
  cancelled: "red",
}

// Which statuses each status may move to; keep in step with
// LABOUR_BOOKING_TRANSITIONS in modules/labour-booking/status.ts (the server
// enforces it, this only keeps the dropdown to valid choices).
const NEXT_STATUSES: Record<LabourBooking["status"], LabourBooking["status"][]> = {
  requested: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  completed: ["confirmed"],
  cancelled: ["requested"],
}
const STATUS_LABEL: Record<LabourBooking["status"], string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
}

const formatSchedule = (booking: LabourBooking) => {
  if (booking.rate_type === "day") {
    return booking.start_date === booking.end_date
      ? booking.start_date
      : `${booking.start_date} → ${booking.end_date}`
  }
  return `${booking.start_date} ${booking.scheduled_time} (${booking.duration_hours}h)`
}

const LabourBookingsPage = () => {
  const [bookings, setBookings] = useState<LabourBooking[] | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = async () => {
    const res = await fetch("/admin/labour-bookings", { credentials: "include" })
    const body = await res.json()
    setBookings(body.bookings)
  }

  useEffect(() => {
    load()
  }, [])

  const updateStatus = async (id: string, status: LabourBooking["status"]) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`/admin/labour-bookings/${id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        throw new Error((await res.json().catch(() => ({})))?.message ?? "Request failed")
      }
      await load()
    } catch (err) {
      toast.error("Couldn't update status", {
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const markPaymentReceived = async (id: string) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`/admin/labour-bookings/${id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mark_payment_received: true }),
      })
      if (!res.ok) {
        throw new Error((await res.json().catch(() => ({})))?.message ?? "Request failed")
      }
      toast.success("Payment marked as received")
      await load()
    } catch (err) {
      toast.error("Couldn't mark payment received", {
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Labour & Manpower Bookings</Heading>
      </div>
      {/* The Admin's Container clips overflow and Table is a bare <table>, so
          without this wrapper the right-hand columns are unreachable on a
          phone. */}
      <div className="overflow-x-auto">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Service</Table.HeaderCell>
            <Table.HeaderCell>Schedule</Table.HeaderCell>
            <Table.HeaderCell>Workers</Table.HeaderCell>
            <Table.HeaderCell>Address</Table.HeaderCell>
            <Table.HeaderCell>Contact</Table.HeaderCell>
            <Table.HeaderCell>Payment</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {bookings?.map((booking) => (
            <Table.Row key={booking.id}>
              <Table.Cell>
                <Text weight="plus">{booking.service_name}</Text>
                <Text size="small" className="text-ui-fg-subtle">
                  {booking.rate_type === "day" ? "Per day" : "Per hour"} — ₹
                  {booking.rate_amount}
                </Text>
              </Table.Cell>
              <Table.Cell>{formatSchedule(booking)}</Table.Cell>
              <Table.Cell>{booking.num_workers}</Table.Cell>
              <Table.Cell>
                {booking.address_1}
                {booking.landmark ? `, near ${booking.landmark}` : ""}, {booking.city}{" "}
                {booking.postal_code}
              </Table.Cell>
              <Table.Cell>
                {booking.phone}
                {booking.email && (
                  <>
                    <br />
                    {booking.email}
                  </>
                )}
              </Table.Cell>
              <Table.Cell>
                <Text>{booking.payment_method === "cod" ? "Cash (after the work)" : "UPI"}</Text>
                {booking.payment_received ? (
                  <Badge color="green">Received</Badge>
                ) : (
                  <>
                    {booking.payment_customer_confirmed && (
                      <Text size="small" className="text-ui-fg-subtle">
                        Customer marked paid
                      </Text>
                    )}
                    <Button
                      size="small"
                      variant="secondary"
                      disabled={updatingId === booking.id}
                      onClick={() => markPaymentReceived(booking.id)}
                    >
                      Mark Received
                    </Button>
                  </>
                )}
              </Table.Cell>
              <Table.Cell>
                <Badge color={STATUS_COLOR[booking.status]}>{booking.status}</Badge>
              </Table.Cell>
              <Table.Cell>
                <Select
                  value={booking.status}
                  onValueChange={(value) =>
                    updateStatus(booking.id, value as LabourBooking["status"])
                  }
                  disabled={updatingId === booking.id}
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Change status" />
                  </Select.Trigger>
                  <Select.Content>
                    {[booking.status, ...NEXT_STATUSES[booking.status]].map((status) => (
                      <Select.Item key={status} value={status}>
                        {STATUS_LABEL[status]}
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      </div>
      {bookings?.length === 0 && (
        <div className="px-6 py-8 text-center">
          <Text className="text-ui-fg-subtle">No bookings yet.</Text>
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Labour Bookings",
  icon: Wrench,
})

export default LabourBookingsPage
