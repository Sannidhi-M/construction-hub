import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LABOUR_BOOKING_MODULE } from "../../../modules/labour-booking"
import LabourBookingModuleService from "../../../modules/labour-booking/service"
import createLabourServiceWorkflow, {
  LabourServiceFields,
} from "../../../workflows/create-labour-service"

// All services, active or not — the Admin needs to see the paused ones too.
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: LabourBookingModuleService =
    req.scope.resolve(LABOUR_BOOKING_MODULE)

  const labour_services = await service.listLabourServices(
    {},
    { order: { sort_order: "ASC", name: "ASC" } }
  )

  res.json({ labour_services })
}

export async function POST(
  req: MedusaRequest<LabourServiceFields>,
  res: MedusaResponse
) {
  const { result: labour_service } = await createLabourServiceWorkflow(
    req.scope
  ).run({ input: req.body })

  res.status(201).json({ labour_service })
}
