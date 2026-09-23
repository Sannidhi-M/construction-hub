import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { DELIVERY_AREA_MODULE } from "../modules/delivery-area"
import DeliveryAreaModuleService from "../modules/delivery-area/service"

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

    const pincode = await deliveryAreaModuleService.createServiceablePincodes(
      input
    )

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
