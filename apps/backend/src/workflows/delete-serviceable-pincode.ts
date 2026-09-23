import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { DELIVERY_AREA_MODULE } from "../modules/delivery-area"
import DeliveryAreaModuleService from "../modules/delivery-area/service"

type DeleteServiceablePincodeInput = {
  id: string
}

const deleteServiceablePincodeStep = createStep(
  "delete-serviceable-pincode",
  async (input: DeleteServiceablePincodeInput, { container }) => {
    const deliveryAreaModuleService: DeliveryAreaModuleService =
      container.resolve(DELIVERY_AREA_MODULE)

    await deliveryAreaModuleService.softDeleteServiceablePincodes(input.id)

    return new StepResponse(input.id, input.id)
  },
  async (pincodeId: string | undefined, { container }) => {
    if (!pincodeId) {
      return
    }

    const deliveryAreaModuleService: DeliveryAreaModuleService =
      container.resolve(DELIVERY_AREA_MODULE)

    await deliveryAreaModuleService.restoreServiceablePincodes(pincodeId)
  }
)

const deleteServiceablePincodeWorkflow = createWorkflow(
  "delete-serviceable-pincode",
  (input: DeleteServiceablePincodeInput) => {
    return new WorkflowResponse(deleteServiceablePincodeStep(input))
  }
)

export default deleteServiceablePincodeWorkflow
