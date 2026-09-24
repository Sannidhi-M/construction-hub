import { completeCartWorkflow } from "@medusajs/medusa/core-flows"
import { MedusaError } from "@medusajs/framework/utils"

/**
 * Server-side minimum order value enforcement (§2.5) — the authoritative
 * check; a cart under the threshold can never become an order, regardless
 * of what a direct Store API call does. The storefront's own check (Review
 * component) is fast UX feedback only, not the real gate.
 *
 * This file has no exports of its own — it's loaded purely for the side
 * effect of registering the hook, via Medusa's auto-import of every file
 * under src/workflows/ (the same mechanism that loads this project's own
 * custom workflows).
 *
 * Threshold is a single env var, not a DB-backed setting — per §2.5, this
 * is expected to change rarely. Left unset or "0" disables the check
 * entirely (no minimum), which is the current default.
 */
const MIN_ORDER_VALUE_INR = Number(process.env.MIN_ORDER_VALUE_INR ?? 0)

completeCartWorkflow.hooks.validate(async ({ cart }) => {
  if (!MIN_ORDER_VALUE_INR) {
    return
  }

  const cartTotal = Number((cart as { total?: number }).total ?? 0)

  if (cartTotal < MIN_ORDER_VALUE_INR) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `The minimum order value is ₹${MIN_ORDER_VALUE_INR}. This cart's total is ₹${cartTotal}.`
    )
  }
})
