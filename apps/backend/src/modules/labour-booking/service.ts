import { MedusaService } from "@medusajs/framework/utils"
import LabourBooking from "./models/labour-booking"
import LabourService from "./models/labour-service"

class LabourBookingModuleService extends MedusaService({
  LabourBooking,
  LabourService,
}) {}

export default LabourBookingModuleService
