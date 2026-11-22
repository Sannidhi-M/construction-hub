import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DELIVERY_AREA_MODULE } from "../../../../modules/delivery-area"
import DeliveryAreaModuleService from "../../../../modules/delivery-area/service"
import { isValidPincode } from "../../../../modules/delivery-area/validation"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const pincode = req.query.pincode

  if (typeof pincode !== "string" || !pincode.trim()) {
    res.status(400).json({ message: "Query parameter 'pincode' is required." })
    return
  }

  // Anything that is not a six-digit pincode can't be served: answer without
  // a database lookup.
  if (!isValidPincode(pincode.trim())) {
    res.json({ serviceable: false })
    return
  }

  const deliveryAreaModuleService: DeliveryAreaModuleService = req.scope.resolve(
    DELIVERY_AREA_MODULE
  )

  const serviceable = await deliveryAreaModuleService.isServiceable(pincode.trim())

  res.json({ serviceable })
}
