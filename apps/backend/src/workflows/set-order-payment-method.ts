import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { MedusaError, Modules } from "@medusajs/framework/utils"

/**
 * Records how a phone order (made via Draft Orders) will be paid. Website
 * orders get `payment_method` from the checkout; a Draft Order skips
 * checkout, so without this the order has none and a cash-on-delivery order
 * is labelled and handled as UPI. Lives in `order.metadata`, the same place
 * the checkout puts it. Only an order with none set can be given one — that
 * keeps this from rewriting a website order's choice.
 */

export const PAYMENT_METHODS = ["upi", "cod"] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

type SetOrderPaymentMethodInput = {
  order_id: string
  payment_method: string
}

const setOrderPaymentMethodStep = createStep(
  "set-order-payment-method",
  async (input: SetOrderPaymentMethodInput, { container }) => {
    if (!PAYMENT_METHODS.includes(input.payment_method as PaymentMethod)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Payment method must be one of: ${PAYMENT_METHODS.join(", ")}.`
      )
    }

    const orderModuleService = container.resolve(Modules.ORDER)
    const order = await orderModuleService.retrieveOrder(input.order_id, {
      select: ["id", "status", "metadata"],
    })

    if (order.status === "canceled") {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Order ${order.id} is cancelled.`
      )
    }
    if (order.metadata?.payment_method) {
      throw new MedusaError(
        MedusaError.Types.NOT_ALLOWED,
        `Order ${order.id} already has a payment method.`
      )
    }

    await orderModuleService.updateOrders(input.order_id, {
      metadata: { ...(order.metadata ?? {}), payment_method: input.payment_method },
    })

    return new StepResponse(input.payment_method)
  }
)

const setOrderPaymentMethodWorkflow = createWorkflow(
  "set-order-payment-method",
  (input: SetOrderPaymentMethodInput) => {
    return new WorkflowResponse(setOrderPaymentMethodStep(input))
  }
)

export default setOrderPaymentMethodWorkflow
