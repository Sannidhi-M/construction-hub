import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LABOUR_BOOKING_MODULE } from "../../../../modules/labour-booking"
import LabourBookingModuleService from "../../../../modules/labour-booking/service"
import updateLabourServiceWorkflow from "../../../../workflows/update-labour-service"
import deleteLabourServiceWorkflow from "../../../../workflows/delete-labour-service"
import { LabourServiceFields } from "../../../../workflows/create-labour-service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: LabourBookingModuleService =
    req.scope.resolve(LABOUR_BOOKING_MODULE)

  const labour_service = await service.retrieveLabourService(req.params.id)

  res.json({ labour_service })
}

export async function POST(
  req: MedusaRequest<Partial<LabourServiceFields>>,
  res: MedusaResponse
) {
  const { result: labour_service } = await updateLabourServiceWorkflow(
    req.scope
  ).run({ input: { id: req.params.id, ...req.body } })

  res.json({ labour_service })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  await deleteLabourServiceWorkflow(req.scope).run({ input: req.params.id })

  res.json({ id: req.params.id, deleted: true })
}
