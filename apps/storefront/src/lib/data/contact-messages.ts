"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { getAuthHeaders } from "./cookies"

export type ContactMessage = {
  id: string
  topic_slug: string
  topic_name: string
  name: string
  email: string
  phone: string | null
  message: string
  status: "new" | "replied" | "closed"
  created_at: string
}

export type SendContactMessageInput = {
  topic_slug: string
  name: string
  email: string
  phone: string
  message: string
  // Honeypot (a hidden field real visitors never fill) — see the backend
  // route. Passed through untouched.
  website?: string
}

// Open to guests: a signed-in visitor's auth header is sent when there is
// one (so the message gets linked to their account), but none is required.
// The backend answers a honeypot hit with `{ sent: true }` and no record, so
// `contact_message` is absent in that case.
export const sendContactMessage = async (
  input: SendContactMessageInput
): Promise<ContactMessage | null> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.client
    .fetch<{ contact_message?: ContactMessage }>("/store/contact-messages", {
      method: "POST",
      body: input,
      headers,
    })
    .then(({ contact_message }) => contact_message ?? null)
    .catch((err) => medusaError(err))
}
