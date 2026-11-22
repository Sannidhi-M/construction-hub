import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { DELIVERY_AREA_MODULE } from "../modules/delivery-area"
import DeliveryAreaModuleService from "../modules/delivery-area/service"
import { parseAreaLabel, parsePincode } from "../modules/delivery-area/validation"

type CreateServiceablePincodeInput = {
  pincode: string
  area_label?: string
  is_active?: boolean
}

const createServiceablePincodeStep = createStep(
  "create-serviceable-pincode",
  async (input: CreateServiceablePincodeInput, { container }) => {
    const deliveryAreaModuleService: DeliveryAreaModuleService =
      container.resolve(DELIVERY_AREA_MODULE)

    const value = parsePincode(input.pincode)
    const [existing] = await deliveryAreaModuleService.listServiceablePincodes({
      pincode: value,
    })
    if (existing) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Pincode ${value} is already in the list.`
      )
    }

    const pincode = await deliveryAreaModuleService.createServiceablePincodes({
      pincode: value,
      area_label: parseAreaLabel(input.area_label),
      is_active: input.is_active !== false,
    })

    return new StepResponse(pincode, pincode.id)
  },
  async (pincodeId: string | undefined, { container }) => {
    if (!pincodeId) {
      return
    }

    const deliveryAreaModuleService: DeliveryAreaModuleService =
      container.resolve(DELIVERY_AREA_MODULE)

    await deliveryAreaModuleService.deleteServiceablePincodes(pincodeId)
  }
)

const createServiceablePincodeWorkflow = createWorkflow(
  "create-serviceable-pincode",
  (input: CreateServiceablePincodeInput) => {
    return new WorkflowResponse(createServiceablePincodeStep(input))
  }
)

export default createServiceablePincodeWorkflow
