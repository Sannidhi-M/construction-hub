import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LABOUR_BOOKING_MODULE } from "../../../modules/labour-booking"
import LabourBookingModuleService from "../../../modules/labour-booking/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const labourBookingModuleService: LabourBookingModuleService =
    req.scope.resolve(LABOUR_BOOKING_MODULE)

  const bookings = await labourBookingModuleService.listLabourBookings(
    {},
    { order: { created_at: "DESC" } }
  )

  res.json({ bookings })
}
