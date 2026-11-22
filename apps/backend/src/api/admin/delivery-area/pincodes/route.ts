import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { DELIVERY_AREA_MODULE } from "../../../../modules/delivery-area"
import DeliveryAreaModuleService from "../../../../modules/delivery-area/service"
import createServiceablePincodeWorkflow from "../../../../workflows/create-serviceable-pincode"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const deliveryAreaModuleService: DeliveryAreaModuleService = req.scope.resolve(
    DELIVERY_AREA_MODULE
  )

  const pincodes = await deliveryAreaModuleService.listServiceablePincodes()

  res.json({ pincodes })
}

type CreatePincodeBody = {
  pincode: string
  area_label?: string
  is_active?: boolean
}

export async function POST(req: MedusaRequest<CreatePincodeBody>, res: MedusaResponse) {
  const { pincode, area_label, is_active } = req.body

  // Validation (6 digits, label length, duplicates) lives in the workflow.
  const { result: created } = await createServiceablePincodeWorkflow(
    req.scope
  ).run({
    input: { pincode, area_label, is_active },
  })

  res.status(201).json({ pincode: created })
}
