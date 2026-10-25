import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import createQuoteRequestWorkflow from "../../../workflows/create-quote-request"

type CreateQuoteRequestBody = {
  service_slug: string
  name: string
  email: string
  notes?: string
}

/**
 * Requires a phone-verified customer session (see middlewares.ts) — same
 * gate as labour bookings: ties every request to a real, reachable number
 * and keeps this open endpoint from being spammed. The stored phone comes
 * from that customer's record, not the body (see the workflow).
 */
export async function POST(
  req: AuthenticatedMedusaRequest<CreateQuoteRequestBody>,
  res: MedusaResponse
) {
  const { service_slug, name, email, notes } = req.body

  const { result: quoteRequest } = await createQuoteRequestWorkflow(
    req.scope
  ).run({
    input: {
      service_slug,
      name,
      email,
      notes,
      customer_id: req.auth_context.actor_id,
    },
  })

  res.status(201).json({ quote_request: quoteRequest })
}
