import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import voidFreeClaimWorkflow from "../../../../../workflows/void-free-claim"

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { result: quoteRequest } = await voidFreeClaimWorkflow(req.scope).run({
    input: { id: req.params.id },
  })

  res.json({ quote_request: quoteRequest })
}
