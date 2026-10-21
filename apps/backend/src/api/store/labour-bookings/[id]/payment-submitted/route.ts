import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { LABOUR_BOOKING_MODULE } from "../../../../../modules/labour-booking"
import LabourBookingModuleService from "../../../../../modules/labour-booking/service"

/**
 * Customer's "I've Paid" self-report for a UPI booking — a hint for admin
 * only, same semantics as the equivalent order route. Never marks payment
 * as actually received; only admin's "Mark Payment Received" action does.
 */
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const { id } = req.params

  const labourBookingModuleService: LabourBookingModuleService =
    req.scope.resolve(LABOUR_BOOKING_MODULE)

  const booking = await labourBookingModuleService.retrieveLabourBooking(id)

  if (booking.customer_id !== req.auth_context.actor_id) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "This booking does not belong to you."
    )
  }

  await labourBookingModuleService.updateLabourBookings({
    id,
    payment_customer_confirmed: true,
  })

  res.json({ success: true })
}
