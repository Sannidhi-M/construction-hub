import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import { QUOTE_REQUEST_MODULE } from "../modules/quote-request"
import QuoteRequestModuleService from "../modules/quote-request/service"

type VoidFreeClaimInput = { id: string }

/**
 * Gives a customer their free service back — e.g. it couldn't be delivered
 * or they asked for something else. Clears the flag (which frees the
 * one-per-customer slot) and leaves a line in the Admin note, so the request
 * keeps its history of having been a free claim.
 */
const voidFreeClaimStep = createStep(
  "void-free-claim",
  async (input: VoidFreeClaimInput, { container }) => {
    const service: QuoteRequestModuleService =
      container.resolve(QUOTE_REQUEST_MODULE)

    const previous = await service.retrieveQuoteRequest(input.id)
    if (!previous.is_free_claim) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "This request isn't a free claim."
      )
    }

    const note = [previous.admin_note, "Free claim voided by Admin."]
      .filter(Boolean)
      .join("\n")
    const updated = await service.updateQuoteRequests({
      id: input.id,
      is_free_claim: false,
      admin_note: note,
    })

    return new StepResponse(updated, previous)
  },
  async (previous, { container }) => {
    if (!previous) {
      return
    }
    const service: QuoteRequestModuleService =
      container.resolve(QUOTE_REQUEST_MODULE)
    await service.updateQuoteRequests({
      id: previous.id,
      is_free_claim: true,
      admin_note: previous.admin_note,
    })
  }
)

const voidFreeClaimWorkflow = createWorkflow(
  "void-free-claim",
  (input: VoidFreeClaimInput) => {
    return new WorkflowResponse(voidFreeClaimStep(input))
  }
)

export default voidFreeClaimWorkflow
