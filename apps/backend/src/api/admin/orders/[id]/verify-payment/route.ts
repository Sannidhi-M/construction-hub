import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import verifyOrderPaymentWorkflow from "../../../../../workflows/verify-order-payment"

type VerifyOrderPaymentBody = {
  admin_note?: string
}

/**
 * "Mark Payment Verified" (§3.2), surfaced from the order detail widget
 * (§3.4). Authn/authz is free here: every route under src/api/admin/**
 * inherits Medusa's own admin session middleware, so an unauthenticated
 * request or a customer session is rejected before this handler ever runs.
 */
export async function POST(
  req: AuthenticatedMedusaRequest<VerifyOrderPaymentBody>,
  res: MedusaResponse
) {
  const { id } = req.params

  const { result } = await verifyOrderPaymentWorkflow(req.scope).run({
    input: {
      order_id: id,
      verified_by: req.auth_context.actor_id,
      admin_note: req.body?.admin_note,
    },
  })

  res.json({ payment: result })
}
