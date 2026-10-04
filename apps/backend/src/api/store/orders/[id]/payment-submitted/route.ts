import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError, Modules } from "@medusajs/framework/utils"

/**
 * "I've Paid" (customer-facing, §4.2 UPI flow extension) — the customer
 * self-reports that they've sent the UPI payment. This is a hint for the
 * admin (surfaced in the payment-verification widget), nothing more: it
 * does NOT capture or otherwise advance the payment. Money is only ever
 * marked received by the admin's own "Mark Payment Verified" action
 * (§3.2, verify-order-payment workflow) after they've actually checked
 * their UPI app/bank statement. Keeping these two actions fully separate
 * means a customer mis-clicking "I've Paid" (or lying) can never move
 * real money state — it only ever changes what the admin sees.
 */
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params

  const orderModuleService = req.scope.resolve(Modules.ORDER)

  const order = await orderModuleService.retrieveOrder(id, {
    select: ["id", "customer_id", "metadata"],
  })

  if (order.customer_id !== req.auth_context.actor_id) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "This order does not belong to you."
    )
  }

  await orderModuleService.updateOrders(id, {
    metadata: {
      ...(order.metadata ?? {}),
      payment_customer_confirmed: true,
      payment_customer_confirmed_at: new Date().toISOString(),
    },
  })

  res.json({ success: true })
}
