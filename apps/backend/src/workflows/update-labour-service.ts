import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { LABOUR_BOOKING_MODULE } from "../modules/labour-booking"
import LabourBookingModuleService from "../modules/labour-booking/service"
import {
  LabourServiceFields,
  validateLabourServiceFields,
} from "./create-labour-service"

// The slug is deliberately not editable: bookings store it, so changing it
// would orphan them.
type UpdateLabourServiceInput = { id: string } & Partial<LabourServiceFields>

const updateLabourServiceStep = createStep(
  "update-labour-service",
  async ({ id, ...changes }: UpdateLabourServiceInput, { container }) => {
    validateLabourServiceFields(changes, { partial: true })

    const service: LabourBookingModuleService =
      container.resolve(LABOUR_BOOKING_MODULE)

    const previous = await service.retrieveLabourService(id)

    const updated = await service.updateLabourServices({
      id,
      ...(changes.name !== undefined && { name: changes.name.trim() }),
      ...(changes.category !== undefined && { category: changes.category }),
      ...(changes.description !== undefined && {
        description: changes.description.trim(),
      }),
      ...(changes.per_day_rate !== undefined && { per_day_rate: changes.per_day_rate }),
      ...(changes.per_hour_rate !== undefined && { per_hour_rate: changes.per_hour_rate }),
      ...(changes.min_booking_hours !== undefined && {
        min_booking_hours: changes.min_booking_hours,
      }),
      // null/"" clears the photo
      ...(changes.image_url !== undefined && {
        image_url: changes.image_url?.trim() || null,
      }),
      ...(changes.is_active !== undefined && { is_active: changes.is_active }),
      ...(changes.sort_order !== undefined && { sort_order: changes.sort_order }),
    })

    return new StepResponse(updated, previous)
  },
  async (
    previous:
      | Awaited<ReturnType<LabourBookingModuleService["retrieveLabourService"]>>
      | undefined,
    { container }
  ) => {
    if (!previous) {
      return
    }
    const service: LabourBookingModuleService =
      container.resolve(LABOUR_BOOKING_MODULE)
    await service.updateLabourServices({
      id: previous.id,
      name: previous.name,
      category: previous.category,
      description: previous.description,
      per_day_rate: previous.per_day_rate,
      per_hour_rate: previous.per_hour_rate,
      min_booking_hours: previous.min_booking_hours,
      image_url: previous.image_url,
      is_active: previous.is_active,
      sort_order: previous.sort_order,
    })
  }
)

const updateLabourServiceWorkflow = createWorkflow(
  "update-labour-service",
  (input: UpdateLabourServiceInput) => {
    return new WorkflowResponse(updateLabourServiceStep(input))
  }
)

export default updateLabourServiceWorkflow
