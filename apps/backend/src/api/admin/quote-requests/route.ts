import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { QUOTE_REQUEST_MODULE } from "../../../modules/quote-request"
import QuoteRequestModuleService from "../../../modules/quote-request/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const quoteRequestModuleService: QuoteRequestModuleService =
    req.scope.resolve(QUOTE_REQUEST_MODULE)

  const quoteRequests = await quoteRequestModuleService.listQuoteRequests(
    {},
    { order: { created_at: "DESC" } }
  )

  res.json({ quote_requests: quoteRequests })
}
