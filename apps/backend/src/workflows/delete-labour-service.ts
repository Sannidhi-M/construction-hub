import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { LABOUR_BOOKING_MODULE } from "../modules/labour-booking"
import LabourBookingModuleService from "../modules/labour-booking/service"
import { deleteUploadedFileIfUnused } from "../lib/uploaded-files"

const deleteLabourServiceStep = createStep(
  "delete-labour-service",
  async (id: string, { container }) => {
    const service: LabourBookingModuleService =
      container.resolve(LABOUR_BOOKING_MODULE)

    // Existing bookings keep their own snapshot of the name and rate, so
    // deleting the service doesn't change them.
    const previous = await service.retrieveLabourService(id)
    await service.deleteLabourServices(id)

    return new StepResponse(previous, previous)
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
    await service.createLabourServices({
      slug: previous.slug,
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

// Last step, no compensation: once the service is really gone, its uploaded
// photo goes too (unless something else still uses the same file).
const removeLabourServicePhotoStep = createStep(
  "remove-labour-service-photo",
  async (url: string | null | undefined, { container }) => {
    await deleteUploadedFileIfUnused(container, url)
    return new StepResponse(undefined)
  }
)

const deleteLabourServiceWorkflow = createWorkflow(
  "delete-labour-service",
  (id: string) => {
    const removed = deleteLabourServiceStep(id)
    removeLabourServicePhotoStep(
      transform({ removed }, ({ removed }) => removed?.image_url)
    )
    return new WorkflowResponse(removed)
  }
)

export default deleteLabourServiceWorkflow
