import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LABOUR_BOOKING_MODULE } from "../../../../modules/labour-booking"
import LabourBookingModuleService from "../../../../modules/labour-booking/service"
import updateLabourBookingStatusWorkflow from "../../../../workflows/update-labour-booking-status"
import confirmLabourBookingPaymentWorkflow from "../../../../workflows/confirm-labour-booking-payment"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const labourBookingModuleService: LabourBookingModuleService =
    req.scope.resolve(LABOUR_BOOKING_MODULE)

  const booking = await labourBookingModuleService.retrieveLabourBooking(
    req.params.id
  )

  res.json({ booking })
}

type UpdateLabourBookingBody = {
  status?: "requested" | "confirmed" | "completed" | "cancelled"
  admin_note?: string
  mark_payment_received?: boolean
}

export async function POST(
  req: MedusaRequest<UpdateLabourBookingBody>,
  res: MedusaResponse
) {
  const { status, admin_note, mark_payment_received } = req.body

  if (mark_payment_received) {
    const { result: booking } = await confirmLabourBookingPaymentWorkflow(
      req.scope
    ).run({
      input: { id: req.params.id, admin_note },
    })

    res.json({ booking })
    return
  }

  if (!status) {
    res.status(400).json({ message: "'status' is required." })
    return
  }

  const { result: booking } = await updateLabourBookingStatusWorkflow(
    req.scope
  ).run({
    input: { id: req.params.id, status, admin_note },
  })

  res.json({ booking })
}
