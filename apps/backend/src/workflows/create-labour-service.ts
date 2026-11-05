import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { LABOUR_BOOKING_MODULE } from "../modules/labour-booking"
import LabourBookingModuleService from "../modules/labour-booking/service"

export const LABOUR_CATEGORIES = ["Construction", "Finishing", "General"] as const

export type LabourServiceFields = {
  name: string
  category: (typeof LABOUR_CATEGORIES)[number]
  description: string
  per_day_rate: number
  per_hour_rate: number
  min_booking_hours: number
  image_url?: string | null
  is_active?: boolean
  sort_order?: number
}

const invalid = (message: string) =>
  new MedusaError(MedusaError.Types.INVALID_DATA, message)

const isWholeNumber = (value: unknown, min: number): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= min

/**
 * Shared by create and update. On update only the fields present are checked
 * (`partial`), but each one that is present must be valid.
 */
export function validateLabourServiceFields(
  input: Partial<LabourServiceFields>,
  { partial }: { partial: boolean }
) {
  const present = (key: keyof LabourServiceFields) =>
    !partial || input[key] !== undefined

  if (present("name") && !input.name?.trim()) {
    throw invalid("A service name is required.")
  }
  if (
    present("category") &&
    !LABOUR_CATEGORIES.includes(input.category as (typeof LABOUR_CATEGORIES)[number])
  ) {
    throw invalid(`Category must be one of: ${LABOUR_CATEGORIES.join(", ")}.`)
  }
  if (present("description") && !input.description?.trim()) {
    throw invalid("A description is required.")
  }
  if (present("per_day_rate") && !isWholeNumber(input.per_day_rate, 1)) {
    throw invalid("The per-day rate must be a whole number of rupees, at least 1.")
  }
  if (present("per_hour_rate") && !isWholeNumber(input.per_hour_rate, 1)) {
    throw invalid("The per-hour rate must be a whole number of rupees, at least 1.")
  }
  if (present("min_booking_hours") && !isWholeNumber(input.min_booking_hours, 1)) {
    throw invalid("The minimum booking hours must be a whole number, at least 1.")
  }
  if (input.sort_order !== undefined && !isWholeNumber(input.sort_order, 0)) {
    throw invalid("The sort order must be a whole number, 0 or more.")
  }
}

// "Wall Painting & Tiling" -> "wall-painting-tiling"
const slugify = (name: string) =>
  name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const createLabourServiceStep = createStep(
  "create-labour-service",
  async (input: LabourServiceFields, { container }) => {
    validateLabourServiceFields(input, { partial: false })

    const service: LabourBookingModuleService =
      container.resolve(LABOUR_BOOKING_MODULE)

    // The slug is the identifier bookings store, so it must be unique and,
    // once made, never changes. Two services with the same name get -2, -3…
    const base = slugify(input.name)
    if (!base) {
      throw invalid("The service name must contain letters or numbers.")
    }
    let slug = base
    for (let n = 2; (await service.listLabourServices({ slug })).length > 0; n++) {
      slug = `${base}-${n}`
    }

    const created = await service.createLabourServices({
      slug,
      name: input.name.trim(),
      category: input.category,
      description: input.description.trim(),
      per_day_rate: input.per_day_rate,
      per_hour_rate: input.per_hour_rate,
      min_booking_hours: input.min_booking_hours,
      image_url: input.image_url?.trim() || null,
      is_active: input.is_active ?? true,
      sort_order: input.sort_order ?? 0,
    })

    return new StepResponse(created, created.id)
  },
  async (id: string | undefined, { container }) => {
    if (!id) {
      return
    }
    const service: LabourBookingModuleService =
      container.resolve(LABOUR_BOOKING_MODULE)
    await service.deleteLabourServices(id)
  }
)

const createLabourServiceWorkflow = createWorkflow(
  "create-labour-service",
  (input: LabourServiceFields) => {
    return new WorkflowResponse(createLabourServiceStep(input))
  }
)

export default createLabourServiceWorkflow
