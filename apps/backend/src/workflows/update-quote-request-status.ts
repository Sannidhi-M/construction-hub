import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { parseAdminNote } from "../lib/admin-note"
import { QUOTE_REQUEST_MODULE } from "../modules/quote-request"
import QuoteRequestModuleService from "../modules/quote-request/service"

type UpdateQuoteRequestStatusInput = {
  id: string
  status: "new" | "contacted" | "quoted" | "closed"
  admin_note?: string
}

const updateQuoteRequestStatusStep = createStep(
  "update-quote-request-status",
  async (input: UpdateQuoteRequestStatusInput, { container }) => {
    const quoteRequestModuleService: QuoteRequestModuleService =
      container.resolve(QUOTE_REQUEST_MODULE)

    const previous = await quoteRequestModuleService.retrieveQuoteRequest(
      input.id
    )

    const adminNote = parseAdminNote(input.admin_note)
    const updated = await quoteRequestModuleService.updateQuoteRequests({
      id: input.id,
      status: input.status,
      ...(adminNote !== undefined && { admin_note: adminNote }),
    })

    return new StepResponse(updated, previous)
  },
  async (
    previous:
      | Awaited<ReturnType<QuoteRequestModuleService["retrieveQuoteRequest"]>>
      | undefined,
    { container }
  ) => {
    if (!previous) {
      return
    }

    const quoteRequestModuleService: QuoteRequestModuleService =
      container.resolve(QUOTE_REQUEST_MODULE)

    await quoteRequestModuleService.updateQuoteRequests({
      id: previous.id,
      status: previous.status,
      admin_note: previous.admin_note,
    })
  }
)

const updateQuoteRequestStatusWorkflow = createWorkflow(
  "update-quote-request-status",
  (input: UpdateQuoteRequestStatusInput) => {
    return new WorkflowResponse(updateQuoteRequestStatusStep(input))
  }
)

export default updateQuoteRequestStatusWorkflow
