import {
  createStep,
  createWorkflow,
  StepResponse,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { MedusaError, Modules } from "@medusajs/framework/utils"
import { useQueryGraphStep, capturePaymentWorkflow } from "@medusajs/medusa/core-flows"

/**
 * Manual UPI payment verification (§3.2) — this is what turns an order's
 * payment session from `pending_authorization` into `captured` once the
 * admin has confirmed the money actually arrived in the business's UPI
 * account (checked outside Medusa; there is no gateway callback for a
 * static UPI QR). Treated as its own privileged pipeline rather than a
 * generic order PATCH, per the architecture doc:
 *
 *   Load order/payment -> validate state -> validate amount
 *   -> idempotent capture (Medusa's own capturePaymentWorkflow)
 *   -> record verification details
 *
 * Admin authn/authz is handled for free by Medusa's own admin route
 * middleware (any route under src/api/admin/** inherits it) — this
 * workflow only owns the state/amount checks and the capture itself.
 */

type VerifyOrderPaymentInput = {
  order_id: string
  verified_by: string
  admin_note?: string
}

type OrderPaymentForVerification = {
  id: string
  status: string
  total: number
  currency_code: string
  payment_collections?: Array<{
    payments?: Array<{
      id: string
      amount: number
      currency_code: string
      captured_at?: string | Date | null
    }>
  }>
}

/**
 * Resolves the single payment to capture and enforces the state/amount
 * rules from §3.2. Throws distinct MedusaErrors so the admin UI (and the
 * exit-criteria test matrix) can tell "already verified" apart from
 * "wrong amount" apart from "cancelled order."
 */
const validatePaymentForVerificationStep = createStep(
  "validate-payment-for-verification",
  async (order: OrderPaymentForVerification | undefined) => {
    if (!order) {
      throw new MedusaError(
        MedusaError.Types.NOT_FOUND,
        "Order not found."
      )
    }

    if (order.status === "canceled") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Order ${order.id} is cancelled; its payment cannot be verified.`
      )
    }

    const payments = (order.payment_collections ?? []).flatMap(
      (paymentCollection) => paymentCollection.payments ?? []
    )

    if (!payments.length) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Order ${order.id} has no payment awaiting verification.`
      )
    }

    // Single-provider (pp_system) flow: one payment collection, one
    // payment per order — see §2.4.
    const payment = payments[0]

    if (payment.captured_at) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Payment for order ${order.id} has already been verified.`
      )
    }

    if (
      Number(payment.amount) !== Number(order.total) ||
      payment.currency_code !== order.currency_code
    ) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `The payment amount (${payment.amount} ${payment.currency_code}) does not match order ${order.id}'s total (${order.total} ${order.currency_code}).`
      )
    }

    return new StepResponse(payment.id)
  }
)

/**
 * `admin_note`/`verified_by`/`verified_at` from §3.2's last pipeline step.
 * No dedicated columns for these — the order model isn't otherwise
 * extended for this v1, so they live in `order.metadata`, alongside
 * whatever's already there.
 */
const recordPaymentVerificationStep = createStep(
  "record-payment-verification-details",
  async (
    input: { order_id: string; verified_by: string; admin_note?: string },
    { container }
  ) => {
    const orderModuleService = container.resolve(Modules.ORDER)

    const order = await orderModuleService.retrieveOrder(input.order_id, {
      select: ["id", "metadata"],
    })

    await orderModuleService.updateOrders(input.order_id, {
      metadata: {
        ...(order.metadata ?? {}),
        payment_verified_by: input.verified_by,
        payment_verified_at: new Date().toISOString(),
        payment_verification_note: input.admin_note ?? null,
      },
    })

    return new StepResponse(undefined)
  }
)

const verifyOrderPaymentWorkflow = createWorkflow(
  "verify-order-payment",
  (input: VerifyOrderPaymentInput) => {
    const orderQuery = useQueryGraphStep({
      entity: "order",
      filters: { id: input.order_id },
      fields: [
        "id",
        "status",
        "total",
        "currency_code",
        "payment_collections.payments.id",
        "payment_collections.payments.amount",
        "payment_collections.payments.currency_code",
        "payment_collections.payments.captured_at",
      ],
      options: { isList: false },
    })

    const order = transform(
      { orderQuery },
      ({ orderQuery }) => orderQuery.data as OrderPaymentForVerification | undefined
    )

    const paymentId = validatePaymentForVerificationStep(order)

    const captureInput = transform(
      { paymentId, input },
      ({ paymentId, input }) => ({
        payment_id: paymentId,
        captured_by: input.verified_by,
      })
    )

    const capturedPayment = capturePaymentWorkflow.runAsStep({
      input: captureInput,
    })

    recordPaymentVerificationStep(input)

    return new WorkflowResponse(capturedPayment)
  }
)

export default verifyOrderPaymentWorkflow
