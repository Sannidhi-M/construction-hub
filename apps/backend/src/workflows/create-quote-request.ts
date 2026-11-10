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
import {
  FREE_CLAIM_SERVICE_SLUGS,
  QUOTE_SERVICES,
} from "../modules/quote-request/service-catalog"

type CreateQuoteRequestInput = {
  service_slug: string
  name: string
  email: string
  notes?: string
  // Use the customer's one free service for this request.
  claim_free?: boolean
  // Injected by the route from the authenticated session, never read from
  // the request body.
  customer_id: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_NAME_LENGTH = 100
const MAX_NOTES_LENGTH = 1000

const invalid = (message: string) =>
  new MedusaError(MedusaError.Types.INVALID_DATA, message)

const FREE_ALREADY_CLAIMED = "You've already used your free service."

const createQuoteRequestStep = createStep(
  "create-quote-request",
  async (input: CreateQuoteRequestInput, { container }) => {
    const service = QUOTE_SERVICES.find((s) => s.slug === input.service_slug)
    if (!service) {
      throw invalid("Please choose a valid service.")
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

    // The request is the customer's own, so it carries the name and email on
    // their account — what Admin sees then matches what they see in My
    // Orders. What was typed in the form is only a fallback for an account
    // that has none (e.g. a phone-only signup). A guest who verified into an
    // EXISTING account (same phone, different typed details) gets the
    // account's details too.
    const accountName = [customer.first_name, customer.last_name]
      .filter(Boolean)
      .join(" ")
      .trim()
    const name = accountName || input.name?.trim()
    if (!name) {
      throw invalid("Please enter your name.")
    }
    if (name.length > MAX_NAME_LENGTH) {
      throw invalid(`Name must be at most ${MAX_NAME_LENGTH} characters.`)
    }

    const email = customer.email?.trim() || input.email?.trim()
    if (!email || !EMAIL_PATTERN.test(email)) {
      throw invalid("Please enter a valid email address.")
    }

    const notes = input.notes?.trim() || null
    if (notes && notes.length > MAX_NOTES_LENGTH) {
      throw invalid(`Notes must be at most ${MAX_NOTES_LENGTH} characters.`)
    }

    const quoteRequestModuleService: QuoteRequestModuleService =
      container.resolve(QUOTE_REQUEST_MODULE)

    const claimFree = input.claim_free === true
    if (claimFree) {
      if (!(FREE_CLAIM_SERVICE_SLUGS as readonly string[]).includes(service.slug)) {
        throw invalid("That service isn't part of the free offer.")
      }
      const existing = await quoteRequestModuleService.listQuoteRequests({
        customer_id: input.customer_id,
        is_free_claim: true,
      })
      if (existing.length > 0) {
        throw invalid(FREE_ALREADY_CLAIMED)
      }
    }

    let quoteRequest
    try {
      quoteRequest = await quoteRequestModuleService.createQuoteRequests({
        service_slug: service.slug,
        service_name: service.name,
        name,
        email,
        phone: customer.phone,
        notes,
        customer_id: input.customer_id,
        is_free_claim: claimFree,
      })
    } catch (error) {
      // Lost a race with another claim by the same customer: the partial
      // unique index above refused the second one.
      if (claimFree && /unique|duplicate/i.test((error as Error).message)) {
        throw invalid(FREE_ALREADY_CLAIMED)
      }
      throw error
    }

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
