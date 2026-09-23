import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DELIVERY_AREA_MODULE } from "../../../../modules/delivery-area"
import DeliveryAreaModuleService from "../../../../modules/delivery-area/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const pincode = req.query.pincode

  if (typeof pincode !== "string" || !pincode.trim()) {
    res.status(400).json({ message: "Query parameter 'pincode' is required." })
    return
  }

  const deliveryAreaModuleService: DeliveryAreaModuleService = req.scope.resolve(
    DELIVERY_AREA_MODULE
  )

  const serviceable = await deliveryAreaModuleService.isServiceable(pincode.trim())

  res.json({ serviceable })
}
