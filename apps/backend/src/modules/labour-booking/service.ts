import { MedusaService } from "@medusajs/framework/utils"
import LabourBooking from "./models/labour-booking"

class LabourBookingModuleService extends MedusaService({
  LabourBooking,
}) {}

export default LabourBookingModuleService
