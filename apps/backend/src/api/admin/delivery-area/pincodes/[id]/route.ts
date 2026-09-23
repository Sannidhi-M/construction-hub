import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import updateServiceablePincodeWorkflow from "../../../../../workflows/update-serviceable-pincode"
import deleteServiceablePincodeWorkflow from "../../../../../workflows/delete-serviceable-pincode"

type UpdatePincodeBody = {
  pincode?: string
  area_label?: string
  is_active?: boolean
}

export async function POST(req: MedusaRequest<UpdatePincodeBody>, res: MedusaResponse) {
  const { result: updated } = await updateServiceablePincodeWorkflow(
    req.scope
  ).run({
    input: {
      id: req.params.id,
      ...req.body,
    },
  })

  res.json({ pincode: updated })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  await deleteServiceablePincodeWorkflow(req.scope).run({
    input: { id: req.params.id },
  })

  res.json({ id: req.params.id, deleted: true })
}
