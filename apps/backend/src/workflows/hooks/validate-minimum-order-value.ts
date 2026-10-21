import { completeCartWorkflow } from "@medusajs/medusa/core-flows"
import { MedusaError } from "@medusajs/framework/utils"
import { DELIVERY_AREA_MODULE } from "../../modules/delivery-area"
import DeliveryAreaModuleService from "../../modules/delivery-area/service"

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

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

// Anchored to Asia/Kolkata, not the backend process's own timezone.
const todayInIndia = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(
    new Date()
  )

// Medusa allows only one validate handler per workflow, so every checkout
// rule lives in this single registration.
completeCartWorkflow.hooks.validate(async ({ cart }, { container }) => {
  if (MIN_ORDER_VALUE_INR) {
    const cartTotal = Number((cart as { total?: number }).total ?? 0)

    if (cartTotal < MIN_ORDER_VALUE_INR) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `The minimum order value is ₹${MIN_ORDER_VALUE_INR}. This cart's total is ₹${cartTotal}.`
      )
    }
  }

  const requested = (cart.metadata as Record<string, unknown> | null)
    ?.requested_delivery_date

  if (requested === undefined || requested === null || requested === "") {
    return
  }

  if (typeof requested !== "string" || !DATE_PATTERN.test(requested)) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "The requested delivery date is not a valid date."
    )
  }

  if (requested < todayInIndia()) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "The requested delivery date cannot be in the past. Please choose today or a later date."
    )
  }

  // Same serviceable-pincode coverage area enforced for Labour bookings
  // (create-labour-booking.ts) — previously this was only a storefront UX
  // hint (the pincode-blur check in ShippingAddress) with nothing stopping
  // a direct Store API call from completing an order outside the area.
  const postalCode = cart.shipping_address?.postal_code

  if (postalCode) {
    const deliveryAreaModuleService: DeliveryAreaModuleService =
      container.resolve(DELIVERY_AREA_MODULE)

    const serviceable = await deliveryAreaModuleService.isServiceable(
      postalCode
    )

    if (!serviceable) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `We don't currently serve pincode ${postalCode}.`
      )
    }
  }
})
