import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { CheckoutSavingProvider } from "@modules/checkout/components/checkout-saving-context"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "Checkout",
}

type Props = {
  searchParams: Promise<{ step?: string }>
}

export default async function Checkout(props: Props) {
  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const { step } = await props.searchParams
  const customer = await retrieveCustomer()

  return (
    <CheckoutSavingProvider>
      <div className="grid grid-cols-1 small:grid-cols-[1fr_456px] content-container gap-x-10 py-8 small:py-12 items-start">
        <CheckoutForm cart={cart} customer={customer} activeStep={step} />
        <CheckoutSummary cart={cart} customer={customer} activeStep={step} />
      </div>
    </CheckoutSavingProvider>
  )
}
