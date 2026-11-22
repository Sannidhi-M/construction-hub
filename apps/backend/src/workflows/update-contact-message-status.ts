import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { parseAdminNote } from "../lib/admin-note"
import { CONTACT_MESSAGE_MODULE } from "../modules/contact-message"
import ContactMessageModuleService from "../modules/contact-message/service"

type UpdateContactMessageStatusInput = {
  id: string
  status: "new" | "replied" | "closed"
  admin_note?: string
}

const updateContactMessageStatusStep = createStep(
  "update-contact-message-status",
  async (input: UpdateContactMessageStatusInput, { container }) => {
    const contactMessageModuleService: ContactMessageModuleService =
      container.resolve(CONTACT_MESSAGE_MODULE)

    const previous = await contactMessageModuleService.retrieveContactMessage(
      input.id
    )

    const adminNote = parseAdminNote(input.admin_note)
    const updated = await contactMessageModuleService.updateContactMessages({
      id: input.id,
      status: input.status,
      ...(adminNote !== undefined && { admin_note: adminNote }),
    })

    return new StepResponse(updated, previous)
  },
  async (
    previous:
      | Awaited<ReturnType<ContactMessageModuleService["retrieveContactMessage"]>>
      | undefined,
    { container }
  ) => {
    if (!previous) {
      return
    }

    const contactMessageModuleService: ContactMessageModuleService =
      container.resolve(CONTACT_MESSAGE_MODULE)

    await contactMessageModuleService.updateContactMessages({
      id: previous.id,
      status: previous.status,
      admin_note: previous.admin_note,
    })
  }
)

const updateContactMessageStatusWorkflow = createWorkflow(
  "update-contact-message-status",
  (input: UpdateContactMessageStatusInput) => {
    return new WorkflowResponse(updateContactMessageStatusStep(input))
  }
)

export default updateContactMessageStatusWorkflow
