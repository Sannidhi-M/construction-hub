import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import updateServiceablePincodeWorkflow from "../../../../../workflows/update-serviceable-pincode"
import deleteServiceablePincodeWorkflow from "../../../../../workflows/delete-serviceable-pincode"

type UpdatePincodeBody = {
  pincode?: string
  area_label?: string
  is_active?: boolean
}

export async function POST(req: MedusaRequest<UpdatePincodeBody>, res: MedusaResponse) {
  // Only these fields can be changed; the id always comes from the URL (a
  // spread of the body would let it override that, or set any other column).
  const { pincode, area_label, is_active } = req.body ?? {}
  const { result: updated } = await updateServiceablePincodeWorkflow(
    req.scope
  ).run({
    input: { id: req.params.id, pincode, area_label, is_active },
  })

  res.json({ pincode: updated })
}

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  await deleteServiceablePincodeWorkflow(req.scope).run({
    input: { id: req.params.id },
  })

  res.json({ id: req.params.id, deleted: true })
}
