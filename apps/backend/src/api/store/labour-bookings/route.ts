import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import createLabourBookingWorkflow from "../../../workflows/create-labour-booking"
import { LABOUR_BOOKING_MODULE } from "../../../modules/labour-booking"
import LabourBookingModuleService from "../../../modules/labour-booking/service"

type CreateLabourBookingBody = {
  service_slug: string
  service_name: string
  rate_type: "day" | "hour"
  rate_amount: number
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
  email?: string
  payment_method: "upi" | "cod"
}

/**
 * The signed-in customer's own bookings, newest first — filtered by
 * `customer_id` in the query itself (not fetched-then-filtered), so one
 * customer's bookings are never loaded for another's request.
 */
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) {
  const labourBookingModuleService: LabourBookingModuleService =
    req.scope.resolve(LABOUR_BOOKING_MODULE)

  const bookings = await labourBookingModuleService.listLabourBookings(
    { customer_id: req.auth_context.actor_id },
    { order: { created_at: "DESC" } }
  )

  res.json({ bookings })
}

/**
 * Requires a phone-verified customer session (see middlewares.ts) — same
 * reasoning as checkout's phone-OTP gate: ties every booking to a real,
 * reachable number and keeps this open endpoint from being spammed.
 */
export async function POST(
  req: AuthenticatedMedusaRequest<CreateLabourBookingBody>,
  res: MedusaResponse
) {
  const { result: booking } = await createLabourBookingWorkflow(req.scope).run({
    input: {
      ...req.body,
      customer_id: req.auth_context.actor_id,
    },
  })

  res.status(201).json({ booking })
}
