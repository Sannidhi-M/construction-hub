import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { DELIVERY_AREA_MODULE } from "../modules/delivery-area"
import DeliveryAreaModuleService from "../modules/delivery-area/service"

type UpdateServiceablePincodeInput = {
  id: string
  pincode?: string
  area_label?: string
  is_active?: boolean
}

const updateServiceablePincodeStep = createStep(
  "update-serviceable-pincode",
  async (input: UpdateServiceablePincodeInput, { container }) => {
    const deliveryAreaModuleService: DeliveryAreaModuleService =
      container.resolve(DELIVERY_AREA_MODULE)

    const previous = await deliveryAreaModuleService.retrieveServiceablePincode(
      input.id
    )

    const updated = await deliveryAreaModuleService.updateServiceablePincodes(
      input
    )

    return new StepResponse(updated, previous)
  },
  async (
    previous:
      | Awaited<ReturnType<DeliveryAreaModuleService["retrieveServiceablePincode"]>>
      | undefined,
    { container }
  ) => {
    if (!previous) {
      return
    }

    const deliveryAreaModuleService: DeliveryAreaModuleService =
      container.resolve(DELIVERY_AREA_MODULE)

    await deliveryAreaModuleService.updateServiceablePincodes({
      id: previous.id,
      pincode: previous.pincode,
      area_label: previous.area_label,
      is_active: previous.is_active,
    })
  }
)

const updateServiceablePincodeWorkflow = createWorkflow(
  "update-serviceable-pincode",
  (input: UpdateServiceablePincodeInput) => {
    return new WorkflowResponse(updateServiceablePincodeStep(input))
  }
)

export default updateServiceablePincodeWorkflow
