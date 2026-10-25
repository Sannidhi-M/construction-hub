import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTACT_MESSAGE_MODULE } from "../../../../modules/contact-message"
import ContactMessageModuleService from "../../../../modules/contact-message/service"
import updateContactMessageStatusWorkflow from "../../../../workflows/update-contact-message-status"

const STATUSES = ["new", "replied", "closed"] as const

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const contactMessageModuleService: ContactMessageModuleService =
    req.scope.resolve(CONTACT_MESSAGE_MODULE)

  const contactMessage = await contactMessageModuleService.retrieveContactMessage(
    req.params.id
  )

  res.json({ contact_message: contactMessage })
}

type UpdateContactMessageBody = {
  status?: (typeof STATUSES)[number]
  admin_note?: string
}

export async function POST(
  req: MedusaRequest<UpdateContactMessageBody>,
  res: MedusaResponse
) {
  const { status, admin_note } = req.body

  if (!status || !STATUSES.includes(status)) {
    res
      .status(400)
      .json({ message: `'status' must be one of: ${STATUSES.join(", ")}.` })
    return
  }

  const { result: contactMessage } = await updateContactMessageStatusWorkflow(
    req.scope
  ).run({
    input: { id: req.params.id, status, admin_note },
  })

  res.json({ contact_message: contactMessage })
}
