import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { LABOUR_BOOKING_MODULE } from "../modules/labour-booking"
import LabourBookingModuleService from "../modules/labour-booking/service"
import { DELIVERY_AREA_MODULE } from "../modules/delivery-area"
import DeliveryAreaModuleService from "../modules/delivery-area/service"

type CreateLabourBookingInput = {
  // Only the slug identifies the service. Its name and rate come from the
  // labour_service record, never from the request — a browser could send
  // anything — and are then stored on the booking as a snapshot.
  service_slug: string
  rate_type: "day" | "hour"
  start_date?: string
  end_date?: string
  scheduled_time?: string
  duration_hours?: number
  num_workers: number
  address_1: string
  landmark?: string
  city: string
  postal_code: string
  phone: string
  customer_id?: string
  email?: string
  payment_method: "upi" | "cod"
}

// Anchored to Asia/Kolkata, not the backend process's own timezone — same
// reasoning as the delivery-date cutoff check (validate-minimum-order-value.ts).
const nowInIndia = () =>
  new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  )

const DAY_CUTOFF_HOUR = 8
const DAY_CUTOFF_MINUTE = 30

// Per-hour bookings are only offered within business hours — same window
// as the storefront's hint (BookingModal's BUSINESS_START/BUSINESS_END).
const BUSINESS_START_MINUTES = 9 * 60
const BUSINESS_END_MINUTES = 17 * 60

const minutesSinceMidnight = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

const toDateOnly = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate())

// Larger jobs are arranged by phone. Keep in step with the storefront's
// MAX_WORKERS_PER_BOOKING (scripts/check-synced-lists.js checks it).
export const MAX_WORKERS_PER_BOOKING = 20

const validateLabourBookingInput = (input: CreateLabourBookingInput) => {
  if (input.num_workers < 1) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "At least one worker is required."
    )
  }
  if (input.num_workers > MAX_WORKERS_PER_BOOKING) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      `A booking can have at most ${MAX_WORKERS_PER_BOOKING} workers. For more, please call us.`
    )
  }

  const now = nowInIndia()

  if (input.rate_type === "day") {
    if (!input.start_date || !input.end_date) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "A start and end date are required for a per-day booking."
      )
    }

    const startDate = new Date(`${input.start_date}T00:00:00`)
    const today = toDateOnly(now)

    if (startDate < today) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "The start date cannot be in the past."
      )
    }

    if (startDate.getTime() === today.getTime()) {
      const cutoffPassed =
        now.getHours() > DAY_CUTOFF_HOUR ||
        (now.getHours() === DAY_CUTOFF_HOUR && now.getMinutes() >= DAY_CUTOFF_MINUTE)

      if (cutoffPassed) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          "Same-day booking is only available before 8:30 AM. Please choose a later date."
        )
      }
    }

    if (new Date(`${input.end_date}T00:00:00`) < startDate) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "The end date cannot be before the start date."
      )
    }
  } else {
    if (!input.start_date || !input.scheduled_time || !input.duration_hours) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "A date, time, and number of hours are required for a per-hour booking."
      )
    }

    const requestedAt = new Date(`${input.start_date}T${input.scheduled_time}`)
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000)

    if (requestedAt < oneHourFromNow) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Per-hour bookings must be made at least 1 hour before the requested time."
      )
    }

    const startMinutes = minutesSinceMidnight(input.scheduled_time)
    const endMinutes = startMinutes + input.duration_hours * 60

    if (startMinutes < BUSINESS_START_MINUTES || endMinutes > BUSINESS_END_MINUTES) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Per-hour bookings are only available between 9:00 AM and 5:00 PM."
      )
    }
  }
}

const createLabourBookingStep = createStep(
  "create-labour-booking",
  async (input: CreateLabourBookingInput, { container }) => {
    validateLabourBookingInput(input)

    // Same serviceable-pincode coverage area as Materials delivery — the
    // storefront's pincode-blur check is a fast UX hint only, this is the
    // authoritative gate.
    const deliveryAreaModuleService: DeliveryAreaModuleService =
      container.resolve(DELIVERY_AREA_MODULE)

    const serviceable = await deliveryAreaModuleService.isServiceable(
      input.postal_code
    )

    if (!serviceable) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `We don't currently serve pincode ${input.postal_code}.`
      )
    }

    const labourBookingModuleService: LabourBookingModuleService =
      container.resolve(LABOUR_BOOKING_MODULE)

    const [labourService] = await labourBookingModuleService.listLabourServices({
      slug: input.service_slug,
      is_active: true,
    })

    if (!labourService) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "This service is not available for booking."
      )
    }

    const booking = await labourBookingModuleService.createLabourBookings({
      ...input,
      service_name: labourService.name,
      rate_amount:
        input.rate_type === "day"
          ? labourService.per_day_rate
          : labourService.per_hour_rate,
      end_date: input.rate_type === "day" ? input.end_date : null,
      scheduled_time: input.rate_type === "hour" ? input.scheduled_time : null,
      duration_hours: input.rate_type === "hour" ? input.duration_hours : null,
    })

    return new StepResponse(booking, booking.id)
  },
  async (bookingId: string | undefined, { container }) => {
    if (!bookingId) {
      return
    }

    const labourBookingModuleService: LabourBookingModuleService =
      container.resolve(LABOUR_BOOKING_MODULE)

    await labourBookingModuleService.deleteLabourBookings(bookingId)
  }
)

const createLabourBookingWorkflow = createWorkflow(
  "create-labour-booking",
  (input: CreateLabourBookingInput) => {
    return new WorkflowResponse(createLabourBookingStep(input))
  }
)

export default createLabourBookingWorkflow
