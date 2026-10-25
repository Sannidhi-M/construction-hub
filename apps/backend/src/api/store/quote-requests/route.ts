import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import createQuoteRequestWorkflow from "../../../workflows/create-quote-request"
import { QUOTE_REQUEST_MODULE } from "../../../modules/quote-request"
import QuoteRequestModuleService from "../../../modules/quote-request/service"

type CreateQuoteRequestBody = {
  service_slug: string
  name: string
  email: string
  notes?: string
}

/**
 * The signed-in customer's own quote requests, newest first — filtered by
 * `customer_id` in the query itself (not fetched-then-filtered), so one
 * customer's requests are never loaded for another's request. Backs the
 * account "My Orders" → Engineering tab.
 */
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const quoteRequestModuleService: QuoteRequestModuleService =
    req.scope.resolve(QUOTE_REQUEST_MODULE)

  const quoteRequests = await quoteRequestModuleService.listQuoteRequests(
    { customer_id: req.auth_context.actor_id },
    { order: { created_at: "DESC" } }
  )

  res.json({ quote_requests: quoteRequests })
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
