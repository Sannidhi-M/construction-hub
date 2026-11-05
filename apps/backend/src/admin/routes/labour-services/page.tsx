import { useEffect, useRef, useState } from "react"
import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Photo, PencilSquare, Plus, Trash, Users } from "@medusajs/icons"
import {
  Badge,
  Button,
  Container,
  Drawer,
  Heading,
  IconButton,
  Input,
  Label,
  Prompt,
  Select,
  Switch,
  Table,
  Text,
  Textarea,
  toast,
} from "@medusajs/ui"

type LabourService = {
  id: string
  slug: string
  name: string
  category: "Construction" | "Finishing" | "General"
  description: string
  per_day_rate: number
  per_hour_rate: number
  min_booking_hours: number
  image_url: string | null
  is_active: boolean
  sort_order: number
}

// Form fields are held as strings (what an <input> gives) and converted on save.
type FormState = {
  name: string
  category: LabourService["category"]
  description: string
  per_day_rate: string
  per_hour_rate: string
  min_booking_hours: string
  sort_order: string
  is_active: boolean
  image_url: string
}

const CATEGORIES: LabourService["category"][] = ["Construction", "Finishing", "General"]

const EMPTY_FORM: FormState = {
  name: "",
  category: "Construction",
  description: "",
  per_day_rate: "",
  per_hour_rate: "",
  min_booking_hours: "4",
  sort_order: "0",
  is_active: true,
  image_url: "",
}

const toForm = (service: LabourService): FormState => ({
  name: service.name,
  category: service.category,
  description: service.description,
  per_day_rate: String(service.per_day_rate),
  per_hour_rate: String(service.per_hour_rate),
  min_booking_hours: String(service.min_booking_hours),
  sort_order: String(service.sort_order),
  is_active: service.is_active,
  image_url: service.image_url ?? "",
})

// A photo uploaded here has an absolute URL and can be previewed. The
// services seeded from the original storefront files point at a storefront
// path ("/images/labour/…"), which this page (served from the backend's
// address) cannot load — shown as "Built-in photo" instead of a broken image.
const isPreviewable = (url: string) => /^https?:\/\//i.test(url)

// The Admin's login is only kept in the backend's memory in development, so a
// backend restart signs everyone out while the open page still looks fine —
// the first sign is a 401. Say what to do about it, not just "Unauthorized".
const errorMessage = async (res: Response) =>
  res.status === 401
    ? "Your admin session has expired. Reload this page and sign in again."
    : (await res.json().catch(() => ({})))?.message ?? "Request failed"

const Thumb = ({ url }: { url: string | null }) =>
  url && isPreviewable(url) ? (
    <img src={url} alt="" className="h-10 w-14 rounded object-cover" />
  ) : (
    <div className="flex h-10 w-14 items-center justify-center rounded bg-ui-bg-subtle text-ui-fg-muted">
      <Photo />
    </div>
  )

const LabourServicesPage = () => {
  const [services, setServices] = useState<LabourService[] | null>(null)
  // null = drawer closed; "new" = adding; otherwise the service being edited
  const [editing, setEditing] = useState<LabourService | "new" | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<LabourService | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const load = async () => {
    const res = await fetch("/admin/labour-services", { credentials: "include" })
    if (!res.ok) {
      toast.error("Couldn't load the services", {
        description: await errorMessage(res),
      })
      setServices([])
      return
    }
    const body = await res.json()
    setServices(body.labour_services)
  }

  useEffect(() => {
    load()
  }, [])

  const openNew = () => {
    setForm({
      ...EMPTY_FORM,
      // new services go to the end of the list by default
      sort_order: String((services?.length ?? 0)),
    })
    setEditing("new")
  }

  const openEdit = (service: LabourService) => {
    setForm(toForm(service))
    setEditing(service)
  }

  const closeDrawer = () => {
    if (!saving && !uploading) {
      setEditing(null)
    }
  }

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  const upload = async (file: File) => {
    setUploading(true)
    try {
      const data = new FormData()
      data.append("files", file)
      const res = await fetch("/admin/uploads", {
        method: "POST",
        credentials: "include",
        body: data,
      })
      if (!res.ok) {
        throw new Error(await errorMessage(res))
      }
      const body = await res.json()
      set("image_url", body.files[0].url)
    } catch (err) {
      toast.error("Couldn't upload the photo", {
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setUploading(false)
      if (fileInput.current) {
        fileInput.current.value = ""
      }
    }
  }

  const save = async () => {
    if (editing === null) {
      return
    }
    setSaving(true)
    try {
      // Sent as numbers; the server validates them (whole rupees, minimums…)
      // and its message is shown if they're wrong.
      const payload = {
        name: form.name,
        category: form.category,
        description: form.description,
        per_day_rate: Number(form.per_day_rate),
        per_hour_rate: Number(form.per_hour_rate),
        min_booking_hours: Number(form.min_booking_hours),
        sort_order: Number(form.sort_order),
        is_active: form.is_active,
        image_url: form.image_url || null,
      }
      const isNew = editing === "new"
      const res = await fetch(
        isNew ? "/admin/labour-services" : `/admin/labour-services/${editing.id}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )
      if (!res.ok) {
        throw new Error(await errorMessage(res))
      }
      toast.success(isNew ? "Service added" : "Service updated")
      setEditing(null)
      await load()
    } catch (err) {
      toast.error("Couldn't save the service", {
        description: err instanceof Error ? err.message : String(err),
      })
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (service: LabourService) => {
    try {
      const res = await fetch(`/admin/labour-services/${service.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !service.is_active }),
      })
      if (!res.ok) {
        throw new Error(await errorMessage(res))
      }
      await load()
    } catch (err) {
      toast.error("Couldn't update the service", {
        description: err instanceof Error ? err.message : String(err),
      })
    }
  }

  const confirmDelete = async () => {
    if (!deleting) {
      return
    }
    try {
      const res = await fetch(`/admin/labour-services/${deleting.id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (!res.ok) {
        throw new Error(await errorMessage(res))
      }
      toast.success(`${deleting.name} deleted`)
      setDeleting(null)
      await load()
    } catch (err) {
      toast.error("Couldn't delete the service", {
        description: err instanceof Error ? err.message : String(err),
      })
    }
  }

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <Heading level="h1">Labour Services</Heading>
          <Text size="small" className="text-ui-fg-subtle">
            The trades customers can book. Changing a rate affects new bookings
            only; existing bookings keep the rate they were made at.
          </Text>
        </div>
        <Button onClick={openNew}>
          <Plus />
          Add service
        </Button>
      </div>

      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Service</Table.HeaderCell>
            <Table.HeaderCell>Category</Table.HeaderCell>
            <Table.HeaderCell>Per day</Table.HeaderCell>
            <Table.HeaderCell>Per hour</Table.HeaderCell>
            <Table.HeaderCell>Min hours</Table.HeaderCell>
            <Table.HeaderCell>Order</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {services?.map((service) => (
            <Table.Row key={service.id}>
              <Table.Cell>
                <div className="flex items-center gap-x-3">
                  <Thumb url={service.image_url} />
                  <div>
                    <Text weight="plus">{service.name}</Text>
                    <Text size="small" className="text-ui-fg-subtle">
                      {service.slug}
                    </Text>
                  </div>
                </div>
              </Table.Cell>
              <Table.Cell>{service.category}</Table.Cell>
              <Table.Cell>₹{service.per_day_rate}</Table.Cell>
              <Table.Cell>₹{service.per_hour_rate}</Table.Cell>
              <Table.Cell>{service.min_booking_hours}</Table.Cell>
              <Table.Cell>{service.sort_order}</Table.Cell>
              <Table.Cell>
                <button
                  type="button"
                  onClick={() => toggleActive(service)}
                  title={service.is_active ? "Click to pause" : "Click to activate"}
                >
                  <Badge color={service.is_active ? "green" : "grey"}>
                    {service.is_active ? "Active" : "Paused"}
                  </Badge>
                </button>
              </Table.Cell>
              <Table.Cell>
                <div className="flex items-center justify-end gap-x-1">
                  <IconButton
                    variant="transparent"
                    onClick={() => openEdit(service)}
                    aria-label={`Edit ${service.name}`}
                  >
                    <PencilSquare />
                  </IconButton>
                  <IconButton
                    variant="transparent"
                    onClick={() => setDeleting(service)}
                    aria-label={`Delete ${service.name}`}
                  >
                    <Trash />
                  </IconButton>
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      {services && services.length === 0 && (
        <Text className="px-6 py-8 text-center text-ui-fg-subtle">
          No labour services yet. Add one to show it on the Labour page.
        </Text>
      )}

      <Drawer open={editing !== null} onOpenChange={(open) => !open && closeDrawer()}>
        <Drawer.Content>
          <Drawer.Header>
            <Drawer.Title>
              {editing === "new" ? "Add labour service" : "Edit labour service"}
            </Drawer.Title>
          </Drawer.Header>
          <Drawer.Body className="flex flex-col gap-y-4 overflow-y-auto">
            <div className="flex flex-col gap-y-1">
              <Label htmlFor="ls-name">Name</Label>
              <Input
                id="ls-name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Tiling"
              />
              {editing !== "new" && editing !== null && (
                <Text size="small" className="text-ui-fg-subtle">
                  The internal ID stays “{editing.slug}” even if you rename it, so
                  past bookings aren't affected.
                </Text>
              )}
            </div>

            <div className="flex flex-col gap-y-1">
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) => set("category", value as FormState["category"])}
              >
                <Select.Trigger>
                  <Select.Value />
                </Select.Trigger>
                <Select.Content>
                  {CATEGORIES.map((category) => (
                    <Select.Item key={category} value={category}>
                      {category}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </div>

            <div className="flex flex-col gap-y-1">
              <Label htmlFor="ls-desc">Description</Label>
              <Textarea
                id="ls-desc"
                rows={3}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="One line shown on the service card"
              />
            </div>

            <div className="grid grid-cols-3 gap-x-3">
              <div className="flex flex-col gap-y-1">
                <Label htmlFor="ls-day">Per day (₹)</Label>
                <Input
                  id="ls-day"
                  type="number"
                  min={1}
                  value={form.per_day_rate}
                  onChange={(e) => set("per_day_rate", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-y-1">
                <Label htmlFor="ls-hour">Per hour (₹)</Label>
                <Input
                  id="ls-hour"
                  type="number"
                  min={1}
                  value={form.per_hour_rate}
                  onChange={(e) => set("per_hour_rate", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-y-1">
                <Label htmlFor="ls-min">Min hours</Label>
                <Input
                  id="ls-min"
                  type="number"
                  min={1}
                  value={form.min_booking_hours}
                  onChange={(e) => set("min_booking_hours", e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-y-1">
              <Label>Photo</Label>
              <Text size="small" className="text-ui-fg-subtle">
                Landscape 4:3, about 1200 × 900 px, JPG under 200 KB.
              </Text>
              <div className="flex items-center gap-x-3">
                <Thumb url={form.image_url || null} />
                <input
                  ref={fileInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      upload(file)
                    }
                  }}
                />
                <Button
                  variant="secondary"
                  size="small"
                  isLoading={uploading}
                  onClick={() => fileInput.current?.click()}
                >
                  {form.image_url ? "Replace photo" : "Upload photo"}
                </Button>
                {form.image_url && (
                  <Button
                    variant="transparent"
                    size="small"
                    onClick={() => set("image_url", "")}
                  >
                    Remove
                  </Button>
                )}
              </div>
              {form.image_url && !isPreviewable(form.image_url) && (
                <Text size="small" className="text-ui-fg-subtle">
                  Using the built-in photo for this service. Upload one to replace it.
                </Text>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-3">
              <div className="flex flex-col gap-y-1">
                <Label htmlFor="ls-order">Display order</Label>
                <Input
                  id="ls-order"
                  type="number"
                  min={0}
                  value={form.sort_order}
                  onChange={(e) => set("sort_order", e.target.value)}
                />
                <Text size="small" className="text-ui-fg-subtle">
                  Lower numbers show first.
                </Text>
              </div>
              <div className="flex items-center gap-x-3 pt-6">
                <Switch
                  id="ls-active"
                  checked={form.is_active}
                  onCheckedChange={(checked) => set("is_active", checked)}
                />
                <Label htmlFor="ls-active">Show on the website</Label>
              </div>
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <Button variant="secondary" onClick={closeDrawer} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={save} isLoading={saving} disabled={uploading}>
              Save
            </Button>
          </Drawer.Footer>
        </Drawer.Content>
      </Drawer>

      <Prompt open={deleting !== null} onOpenChange={(open) => !open && setDeleting(null)}>
        <Prompt.Content>
          <Prompt.Header>
            <Prompt.Title>Delete {deleting?.name}?</Prompt.Title>
            <Prompt.Description>
              It will disappear from the website. Bookings already made keep their
              details. To hide a service for a while instead, pause it.
            </Prompt.Description>
          </Prompt.Header>
          <Prompt.Footer>
            <Prompt.Cancel>Cancel</Prompt.Cancel>
            <Prompt.Action onClick={confirmDelete}>Delete</Prompt.Action>
          </Prompt.Footer>
        </Prompt.Content>
      </Prompt>
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Labour Services",
  icon: Users,
})

export default LabourServicesPage
