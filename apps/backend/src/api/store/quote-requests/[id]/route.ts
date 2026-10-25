import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { QUOTE_REQUEST_MODULE } from "../../../../modules/quote-request"
import QuoteRequestModuleService from "../../../../modules/quote-request/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const quoteRequestModuleService: QuoteRequestModuleService =
    req.scope.resolve(QUOTE_REQUEST_MODULE)

  const quoteRequest = await quoteRequestModuleService.retrieveQuoteRequest(
    req.params.id
  )

  if (quoteRequest.customer_id !== req.auth_context.actor_id) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "This quote request does not belong to you."
    )
  }

  res.json({ quote_request: quoteRequest })
}
