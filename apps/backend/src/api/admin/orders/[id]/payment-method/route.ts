import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import setOrderPaymentMethodWorkflow from "../../../../../workflows/set-order-payment-method"

type SetPaymentMethodBody = {
  payment_method?: string
}

/**
 * Sets UPI / cash on delivery on an order that has none (phone orders made
 * via Draft Orders). Admin authn comes from Medusa's admin middleware, as
 * for verify-payment.
 */
export async function POST(
  req: AuthenticatedMedusaRequest<SetPaymentMethodBody>,
  res: MedusaResponse
) {
  const { result } = await setOrderPaymentMethodWorkflow(req.scope).run({
    input: {
      order_id: req.params.id,
      payment_method: req.body?.payment_method ?? "",
    },
  })

  res.json({ payment_method: result })
}
