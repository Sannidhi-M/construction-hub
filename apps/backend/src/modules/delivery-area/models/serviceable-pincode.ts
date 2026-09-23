import { model } from "@medusajs/framework/utils"

const ServiceablePincode = model.define("serviceable_pincode", {
  id: model.id().primaryKey(),
  pincode: model.text().unique(),
  area_label: model.text().nullable(),
  is_active: model.boolean().default(true),
})

export default ServiceablePincode
