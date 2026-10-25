import { useEffect, useState } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { DocumentText } from "@medusajs/icons"
import {
  Badge,
  Container,
  Heading,
  Select,
  Table,
  Text,
  toast,
} from "@medusajs/ui"

type QuoteRequest = {
  id: string
  service_name: string
  name: string
  email: string
  phone: string
  notes: string | null
  status: "new" | "contacted" | "quoted" | "closed"
  created_at: string
}

const STATUS_COLOR: Record<QuoteRequest["status"], "orange" | "blue" | "purple" | "green"> = {
  new: "orange",
  contacted: "blue",
  quoted: "purple",
  closed: "green",
}

const QuoteRequestsPage = () => {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[] | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = async () => {
    const res = await fetch("/admin/quote-requests", { credentials: "include" })
    const body = await res.json()
    setQuoteRequests(body.quote_requests)
  }

  useEffect(() => {
    load()
  }, [])

  const updateStatus = async (id: string, status: QuoteRequest["status"]) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`/admin/quote-requests/${id}`, {
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

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Quote Requests</Heading>
      </div>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Received</Table.HeaderCell>
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Contact</Table.HeaderCell>
            <Table.HeaderCell>Service</Table.HeaderCell>
            <Table.HeaderCell>Notes</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {quoteRequests?.map((quoteRequest) => (
            <Table.Row key={quoteRequest.id}>
              <Table.Cell>
                {new Date(quoteRequest.created_at).toLocaleString()}
              </Table.Cell>
              <Table.Cell>
                <Text weight="plus">{quoteRequest.name}</Text>
              </Table.Cell>
              <Table.Cell>
                {quoteRequest.phone}
                <br />
                {quoteRequest.email}
              </Table.Cell>
              <Table.Cell>{quoteRequest.service_name}</Table.Cell>
              <Table.Cell className="max-w-xs whitespace-pre-wrap">
                {quoteRequest.notes ?? "—"}
              </Table.Cell>
              <Table.Cell>
                <Badge color={STATUS_COLOR[quoteRequest.status]}>
                  {quoteRequest.status}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <Select
                  value={quoteRequest.status}
                  onValueChange={(value) =>
                    updateStatus(quoteRequest.id, value as QuoteRequest["status"])
                  }
                  disabled={updatingId === quoteRequest.id}
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Change status" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="new">New</Select.Item>
                    <Select.Item value="contacted">Contacted</Select.Item>
                    <Select.Item value="quoted">Quoted</Select.Item>
                    <Select.Item value="closed">Closed</Select.Item>
                  </Select.Content>
                </Select>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      {quoteRequests?.length === 0 && (
        <div className="px-6 py-8 text-center">
          <Text className="text-ui-fg-subtle">No quote requests yet.</Text>
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Quote Requests",
  icon: DocumentText,
})

export default QuoteRequestsPage
