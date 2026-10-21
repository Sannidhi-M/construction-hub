import { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import createLabourBookingWorkflow from "../../../workflows/create-labour-booking"

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
