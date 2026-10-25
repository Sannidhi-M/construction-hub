import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { CONTACT_MESSAGE_MODULE } from "../../../modules/contact-message"
import ContactMessageModuleService from "../../../modules/contact-message/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const contactMessageModuleService: ContactMessageModuleService =
    req.scope.resolve(CONTACT_MESSAGE_MODULE)

  const contactMessages =
    await contactMessageModuleService.listContactMessages(
      {},
      { order: { created_at: "DESC" } }
    )

  res.json({ contact_messages: contactMessages })
}
