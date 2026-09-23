import { MedusaService } from "@medusajs/framework/utils"
import ServiceablePincode from "./models/serviceable-pincode"

class DeliveryAreaModuleService extends MedusaService({
  ServiceablePincode,
}) {
  async isServiceable(pincode: string): Promise<boolean> {
    const [match] = await this.listServiceablePincodes({
      pincode,
      is_active: true,
    })

    return !!match
  }
}

export default DeliveryAreaModuleService
