import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { CONTACT_MESSAGE_MODULE } from "../modules/contact-message"
import ContactMessageModuleService from "../modules/contact-message/service"

/**
 * Removes a message from the Admin inbox (e.g. spam or a test). It is a soft
 * delete — the row stays in the database with a deleted timestamp — and the
 * compensation restores it if a later step ever fails.
 */
const deleteContactMessageStep = createStep(
  "delete-contact-message",
  async (id: string, { container }) => {
    const service: ContactMessageModuleService =
      container.resolve(CONTACT_MESSAGE_MODULE)

    await service.retrieveContactMessage(id) // 404 if it does not exist
    await service.softDeleteContactMessages(id)

    return new StepResponse(undefined, id)
  },
  async (id: string | undefined, { container }) => {
    if (!id) {
      return
    }
    const service: ContactMessageModuleService =
      container.resolve(CONTACT_MESSAGE_MODULE)
    await service.restoreContactMessages(id)
  }
)

const deleteContactMessageWorkflow = createWorkflow(
  "delete-contact-message",
  (id: string) => {
    return new WorkflowResponse(deleteContactMessageStep(id))
  }
)

export default deleteContactMessageWorkflow
