import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { LABOUR_BOOKING_MODULE } from "../../../modules/labour-booking"
import LabourBookingModuleService from "../../../modules/labour-booking/service"

/**
 * The services a customer can book: active ones only, in the order set in
 * the Admin. Public (no login), like browsing products; only fields the
 * storefront shows are returned.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: LabourBookingModuleService =
    req.scope.resolve(LABOUR_BOOKING_MODULE)

  const rows = await service.listLabourServices(
    { is_active: true },
    { order: { sort_order: "ASC", name: "ASC" } }
  )

  res.json({
    labour_services: rows.map((row) => ({
      slug: row.slug,
      name: row.name,
      category: row.category,
      description: row.description,
      per_day_rate: row.per_day_rate,
      per_hour_rate: row.per_hour_rate,
      min_booking_hours: row.min_booking_hours,
      image_url: row.image_url,
    })),
  })
}
