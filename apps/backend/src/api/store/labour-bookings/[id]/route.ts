import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"
import { LABOUR_BOOKING_MODULE } from "../../../../modules/labour-booking"
import LabourBookingModuleService from "../../../../modules/labour-booking/service"

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const labourBookingModuleService: LabourBookingModuleService =
    req.scope.resolve(LABOUR_BOOKING_MODULE)

  const booking = await labourBookingModuleService.retrieveLabourBooking(
    req.params.id
  )

  if (booking.customer_id !== req.auth_context.actor_id) {
    throw new MedusaError(
      MedusaError.Types.NOT_ALLOWED,
      "This booking does not belong to you."
    )
  }

  res.json({ booking })
}
