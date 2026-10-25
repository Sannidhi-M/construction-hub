import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { parsePhoneNumberFromString } from "libphonenumber-js"
import { CONTACT_MESSAGE_MODULE } from "../modules/contact-message"
import ContactMessageModuleService from "../modules/contact-message/service"
import { CONTACT_TOPICS } from "../modules/contact-message/topics"

type CreateContactMessageInput = {
  topic_slug: string
  name: string
  email: string
  phone: string
  message: string
  // Set by the route only when the sender is a signed-in customer; the form
  // itself is open to anyone.
  customer_id?: string | null
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_NAME_LENGTH = 100
const MIN_MESSAGE_LENGTH = 10
const MAX_MESSAGE_LENGTH = 2000

const invalid = (message: string) =>
  new MedusaError(MedusaError.Types.INVALID_DATA, message)

const createContactMessageStep = createStep(
  "create-contact-message",
  async (input: CreateContactMessageInput, { container }) => {
    const topic = CONTACT_TOPICS.find((t) => t.slug === input.topic_slug)
    if (!topic) {
      throw invalid("Please choose a valid subject.")
    }

    const name = input.name?.trim()
    if (!name) {
      throw invalid("Please enter your name.")
    }
    if (name.length > MAX_NAME_LENGTH) {
      throw invalid(`Name must be at most ${MAX_NAME_LENGTH} characters.`)
    }

    const email = input.email?.trim()
    if (!email || !EMAIL_PATTERN.test(email)) {
      throw invalid("Please enter a valid email address.")
    }

    // Required (the business calls back on it) and must be a real number.
    // Stored in E.164 (same as customer phones) so it's consistent and
    // tap-to-call-able. Not OTP-verified — the form is open to anyone.
    const rawPhone = input.phone?.trim()
    if (!rawPhone) {
      throw invalid("Please enter your phone number.")
    }
    const parsedPhone = parsePhoneNumberFromString(rawPhone, "IN")
    if (!parsedPhone?.isValid()) {
      throw invalid("Please enter a valid phone number.")
    }
    const phone = parsedPhone.number

    const message = input.message?.trim()
    if (!message || message.length < MIN_MESSAGE_LENGTH) {
      throw invalid(
        `Please write a message of at least ${MIN_MESSAGE_LENGTH} characters.`
      )
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      throw invalid(`Message must be at most ${MAX_MESSAGE_LENGTH} characters.`)
    }

    const contactMessageModuleService: ContactMessageModuleService =
      container.resolve(CONTACT_MESSAGE_MODULE)

    const contactMessage =
      await contactMessageModuleService.createContactMessages({
        topic_slug: topic.slug,
        topic_name: topic.name,
        name,
        email,
        phone,
        message,
        customer_id: input.customer_id || null,
      })

    return new StepResponse(contactMessage, contactMessage.id)
  },
  async (contactMessageId: string | undefined, { container }) => {
    if (!contactMessageId) {
      return
    }

    const contactMessageModuleService: ContactMessageModuleService =
      container.resolve(CONTACT_MESSAGE_MODULE)

    await contactMessageModuleService.deleteContactMessages(contactMessageId)
  }
)

const createContactMessageWorkflow = createWorkflow(
  "create-contact-message",
  (input: CreateContactMessageInput) => {
    return new WorkflowResponse(createContactMessageStep(input))
  }
)

export default createContactMessageWorkflow
