import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { ICustomerModuleService } from "@medusajs/framework/types"
import { QUOTE_REQUEST_MODULE } from "../modules/quote-request"
import QuoteRequestModuleService from "../modules/quote-request/service"
import { QUOTE_SERVICES } from "../modules/quote-request/service-catalog"

type CreateQuoteRequestInput = {
  service_slug: string
  name: string
  email: string
  notes?: string
  // Injected by the route from the authenticated session, never read from
  // the request body.
  customer_id: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_NAME_LENGTH = 100
const MAX_NOTES_LENGTH = 1000

const invalid = (message: string) =>
  new MedusaError(MedusaError.Types.INVALID_DATA, message)

const createQuoteRequestStep = createStep(
  "create-quote-request",
  async (input: CreateQuoteRequestInput, { container }) => {
    const service = QUOTE_SERVICES.find((s) => s.slug === input.service_slug)
    if (!service) {
      throw invalid("Please choose a valid service.")
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

    const notes = input.notes?.trim() || null
    if (notes && notes.length > MAX_NOTES_LENGTH) {
      throw invalid(`Notes must be at most ${MAX_NOTES_LENGTH} characters.`)
    }

    // The phone on a quote is the customer's own OTP-verified phone, read
    // from their record rather than trusted from the request — so what's
    // stored is always a number that was actually verified, whatever the
    // client sent or displayed.
    const customerModuleService: ICustomerModuleService = container.resolve(
      Modules.CUSTOMER
    )
    const customer = await customerModuleService.retrieveCustomer(
      input.customer_id
    )
    if (!customer.phone) {
      throw invalid(
        "Your account has no verified phone number. Please add one in your account profile first."
      )
    }

    const quoteRequestModuleService: QuoteRequestModuleService =
      container.resolve(QUOTE_REQUEST_MODULE)

    const quoteRequest = await quoteRequestModuleService.createQuoteRequests({
      service_slug: service.slug,
      service_name: service.name,
      name,
      email,
      phone: customer.phone,
      notes,
      customer_id: input.customer_id,
    })

    return new StepResponse(quoteRequest, quoteRequest.id)
  },
  async (quoteRequestId: string | undefined, { container }) => {
    if (!quoteRequestId) {
      return
    }

    const quoteRequestModuleService: QuoteRequestModuleService =
      container.resolve(QUOTE_REQUEST_MODULE)

    await quoteRequestModuleService.deleteQuoteRequests(quoteRequestId)
  }
)

const createQuoteRequestWorkflow = createWorkflow(
  "create-quote-request",
  (input: CreateQuoteRequestInput) => {
    return new WorkflowResponse(createQuoteRequestStep(input))
  }
)

export default createQuoteRequestWorkflow
