import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { LABOUR_BOOKING_MODULE } from "../modules/labour-booking"
import LabourBookingModuleService from "../modules/labour-booking/service"

type UpdateLabourBookingStatusInput = {
  id: string
  status: "requested" | "confirmed" | "completed" | "cancelled"
  admin_note?: string
}

const updateLabourBookingStatusStep = createStep(
  "update-labour-booking-status",
  async (input: UpdateLabourBookingStatusInput, { container }) => {
    const labourBookingModuleService: LabourBookingModuleService =
      container.resolve(LABOUR_BOOKING_MODULE)

    const previous = await labourBookingModuleService.retrieveLabourBooking(
      input.id
    )

    const updated = await labourBookingModuleService.updateLabourBookings(input)

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
      status: previous.status,
      admin_note: previous.admin_note,
    })
  }
)

const updateLabourBookingStatusWorkflow = createWorkflow(
  "update-labour-booking-status",
  (input: UpdateLabourBookingStatusInput) => {
    return new WorkflowResponse(updateLabourBookingStatusStep(input))
  }
)

export default updateLabourBookingStatusWorkflow
