import {
  AuthenticatedMedusaRequest,
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import createContactMessageWorkflow from "../../../workflows/create-contact-message"

type CreateContactMessageBody = {
  topic_slug: string
  name: string
  email: string
  phone: string
  message: string
  // Honeypot: a hidden field real visitors never see or fill. See below.
  website?: string
}

/**
 * Open to anyone — a contact form that demanded sign-in/OTP would defeat its
 * purpose. Abuse is limited instead by a per-IP rate limit (middlewares.ts),
 * a honeypot field, and server-side validation (the workflow). The sender is
 * linked to their account only if they happen to be signed in.
 */
export async function POST(
  req: MedusaRequest<CreateContactMessageBody>,
  res: MedusaResponse
) {
  const { topic_slug, name, email, phone, message, website } = req.body

  // Bots tend to fill every field. A filled honeypot gets the same success
  // response a real submission would, so there's no signal to learn from —
  // but nothing is stored.
  if (website) {
    res.status(201).json({ sent: true })
    return
  }

  const customerId = (req as AuthenticatedMedusaRequest).auth_context?.actor_id

  const { result: contactMessage } = await createContactMessageWorkflow(
    req.scope
  ).run({
    input: {
      topic_slug,
      name,
      email,
      phone,
      message,
      customer_id: customerId || null,
    },
  })

  res.status(201).json({ contact_message: contactMessage })
}
