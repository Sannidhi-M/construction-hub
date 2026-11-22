import { useEffect, useState } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight } from "@medusajs/icons"
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

type ContactMessage = {
  id: string
  topic_name: string
  name: string
  email: string
  phone: string | null
  message: string
  status: "new" | "replied" | "closed"
  created_at: string
}

const STATUS_COLOR: Record<ContactMessage["status"], "orange" | "blue" | "green"> = {
  new: "orange",
  replied: "blue",
  closed: "green",
}

const ContactMessagesPage = () => {
  const [messages, setMessages] = useState<ContactMessage[] | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const load = async () => {
    const res = await fetch("/admin/contact-messages", { credentials: "include" })
    const body = await res.json()
    setMessages(body.contact_messages)
  }

  useEffect(() => {
    load()
  }, [])

  const updateStatus = async (id: string, status: ContactMessage["status"]) => {
    setUpdatingId(id)
    try {
      const res = await fetch(`/admin/contact-messages/${id}`, {
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

  // Removes a message from the inbox (spam, tests). It is kept in the database
  // with a deleted timestamp, so it can be recovered by a developer.
  const deleteMessage = async (contactMessage: ContactMessage) => {
    if (
      !window.confirm(
        `Delete the message from ${contactMessage.name}? It will be removed from this list.`
      )
    ) {
      return
    }
    setUpdatingId(contactMessage.id)
    try {
      const res = await fetch(`/admin/contact-messages/${contactMessage.id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) {
        throw new Error((await res.json().catch(() => ({})))?.message ?? "Request failed")
      }
      await load()
    } catch (err) {
      toast.error("Couldn't delete the message", {
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Contact Messages</Heading>
      </div>
      {/* The Admin's Container clips overflow and Table is a bare <table>, so
          without this wrapper the right-hand columns are unreachable on a
          phone. */}
      <div className="overflow-x-auto">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Received</Table.HeaderCell>
            <Table.HeaderCell>From</Table.HeaderCell>
            <Table.HeaderCell>Subject</Table.HeaderCell>
            <Table.HeaderCell>Message</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell />
            <Table.HeaderCell />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {messages?.map((contactMessage) => (
            <Table.Row key={contactMessage.id}>
              <Table.Cell>
                {new Date(contactMessage.created_at).toLocaleString()}
              </Table.Cell>
              <Table.Cell>
                <Text weight="plus">{contactMessage.name}</Text>
                {contactMessage.email}
                {contactMessage.phone && (
                  <>
                    <br />
                    {contactMessage.phone}
                  </>
                )}
              </Table.Cell>
              <Table.Cell>{contactMessage.topic_name}</Table.Cell>
              <Table.Cell className="max-w-sm whitespace-pre-wrap">
                {contactMessage.message}
              </Table.Cell>
              <Table.Cell>
                <Badge color={STATUS_COLOR[contactMessage.status]}>
                  {contactMessage.status}
                </Badge>
              </Table.Cell>
              <Table.Cell>
                <Select
                  value={contactMessage.status}
                  onValueChange={(value) =>
                    updateStatus(contactMessage.id, value as ContactMessage["status"])
                  }
                  disabled={updatingId === contactMessage.id}
                >
                  <Select.Trigger>
                    <Select.Value placeholder="Change status" />
                  </Select.Trigger>
                  <Select.Content>
                    <Select.Item value="new">New</Select.Item>
                    <Select.Item value="replied">Replied</Select.Item>
                    <Select.Item value="closed">Closed</Select.Item>
                  </Select.Content>
                </Select>
              </Table.Cell>
              <Table.Cell>
                <Button
                  size="small"
                  variant="danger"
                  disabled={updatingId === contactMessage.id}
                  onClick={() => deleteMessage(contactMessage)}
                >
                  Delete
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      </div>
      {messages?.length === 0 && (
        <div className="px-6 py-8 text-center">
          <Text className="text-ui-fg-subtle">No messages yet.</Text>
        </div>
      )}
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Contact Messages",
  icon: ChatBubbleLeftRight,
})

export default ContactMessagesPage
