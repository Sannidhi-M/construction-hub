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

    // Only the fields that were sent are changed, each validated.
    const changes: {
      id: string
      pincode?: string
      area_label?: string | null
      is_active?: boolean
    } = { id: input.id }
    if (input.pincode !== undefined) {
      changes.pincode = parsePincode(input.pincode)
      if (changes.pincode !== previous.pincode) {
        const [existing] =
          await deliveryAreaModuleService.listServiceablePincodes({
            pincode: changes.pincode,
          })
        if (existing) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            `Pincode ${changes.pincode} is already in the list.`
          )
        }
      }
    }
    if (input.area_label !== undefined) {
      changes.area_label = parseAreaLabel(input.area_label)
    }
    if (input.is_active !== undefined) {
      changes.is_active = input.is_active === true
    }

    const updated = await deliveryAreaModuleService.updateServiceablePincodes(
      changes
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
