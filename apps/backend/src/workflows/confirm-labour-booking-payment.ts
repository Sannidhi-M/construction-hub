import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { LABOUR_BOOKING_MODULE } from "../modules/labour-booking"
import LabourBookingModuleService from "../modules/labour-booking/service"

/**
 * Admin's "Mark Payment Received" — purely a status flag on the booking
 * record. There's no Medusa payment/capture involved (see §3 design
 * decisions: a labour booking isn't a cart/order), so this is a plain
 * field update, not Medusa's capturePaymentWorkflow.
 */
type ConfirmLabourBookingPaymentInput = {
  id: string
  admin_note?: string
}

const confirmLabourBookingPaymentStep = createStep(
  "confirm-labour-booking-payment",
  async (input: ConfirmLabourBookingPaymentInput, { container }) => {
    const labourBookingModuleService: LabourBookingModuleService =
      container.resolve(LABOUR_BOOKING_MODULE)

    const previous = await labourBookingModuleService.retrieveLabourBooking(
      input.id
    )

    const updated = await labourBookingModuleService.updateLabourBookings({
      id: input.id,
      payment_received: true,
      admin_note: input.admin_note ?? previous.admin_note,
    })

    return new StepResponse(updated, previous)
  },
  async (
    previous:
      | Awaited<ReturnType<LabourBookingModuleService["retrieveLabourBooking"]>>
      | undefined,
    { container }
  ) => {
    if (!previous) {
      return
    }

    const labourBookingModuleService: LabourBookingModuleService =
      container.resolve(LABOUR_BOOKING_MODULE)

    await labourBookingModuleService.updateLabourBookings({
      id: previous.id,
      payment_received: previous.payment_received,
      admin_note: previous.admin_note,
    })
  }
)

const confirmLabourBookingPaymentWorkflow = createWorkflow(
  "confirm-labour-booking-payment",
  (input: ConfirmLabourBookingPaymentInput) => {
    return new WorkflowResponse(confirmLabourBookingPaymentStep(input))
  }
)

export default confirmLabourBookingPaymentWorkflow
