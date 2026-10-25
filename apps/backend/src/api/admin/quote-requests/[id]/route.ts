import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { QUOTE_REQUEST_MODULE } from "../../../../modules/quote-request"
import QuoteRequestModuleService from "../../../../modules/quote-request/service"
import updateQuoteRequestStatusWorkflow from "../../../../workflows/update-quote-request-status"

const STATUSES = ["new", "contacted", "quoted", "closed"] as const

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const quoteRequestModuleService: QuoteRequestModuleService =
    req.scope.resolve(QUOTE_REQUEST_MODULE)

  const quoteRequest = await quoteRequestModuleService.retrieveQuoteRequest(
    req.params.id
  )

  res.json({ quote_request: quoteRequest })
}

type UpdateQuoteRequestBody = {
  status?: (typeof STATUSES)[number]
  admin_note?: string
}

export async function POST(
  req: MedusaRequest<UpdateQuoteRequestBody>,
  res: MedusaResponse
) {
  const { status, admin_note } = req.body

  if (!status || !STATUSES.includes(status)) {
    res
      .status(400)
      .json({ message: `'status' must be one of: ${STATUSES.join(", ")}.` })
    return
  }

  const { result: quoteRequest } = await updateQuoteRequestStatusWorkflow(
    req.scope
  ).run({
    input: { id: req.params.id, status, admin_note },
  })

  res.json({ quote_request: quoteRequest })
}
