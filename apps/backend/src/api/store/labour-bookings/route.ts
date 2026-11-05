import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import createLabourBookingWorkflow from "../../../workflows/create-labour-booking"
import { LABOUR_BOOKING_MODULE } from "../../../modules/labour-booking"
import LabourBookingModuleService from "../../../modules/labour-booking/service"

type CreateLabourBookingBody = {
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
  const body = req.body

  // Pick the fields a customer may set, rather than passing the body on
  // whole: the booking record also has admin-only fields (status,
  // payment_received, …) that a tampered request must not be able to set.
  // The service's name and rate are looked up server-side, not taken from here.
  const { result: booking } = await createLabourBookingWorkflow(req.scope).run({
    input: {
      service_slug: body.service_slug,
      rate_type: body.rate_type,
      start_date: body.start_date,
      end_date: body.end_date,
      scheduled_time: body.scheduled_time,
      duration_hours: body.duration_hours,
      num_workers: body.num_workers,
      address_1: body.address_1,
      landmark: body.landmark,
      city: body.city,
      postal_code: body.postal_code,
      phone: body.phone,
      email: body.email,
      payment_method: body.payment_method,
      customer_id: req.auth_context.actor_id,
    },
  })

  res.status(201).json({ booking })
}
