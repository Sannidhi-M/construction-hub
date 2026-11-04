import { ReactNode } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Heading, Text } from "@modules/common/components/ui"

const link = (href: string, label: string) => (
  <LocalizedClientLink href={href} className="text-brand-600 hover:underline">
    {label}
  </LocalizedClientLink>
)

// Answers must match the policy pages — if a rule changes there, change it
// here too.
const questions: { q: string; a: ReactNode }[] = [
  {
    q: "I paid by UPI but my order isn't confirmed. What now?",
    a: (
      <>
        We verify UPI payments by hand, so confirmation isn&apos;t instant. Make
        sure you tapped &ldquo;I&apos;ve Paid&rdquo; on the order page. If it is
        still pending after a while, contact us with your order number and the
        UPI transaction reference.
      </>
    ),
  },
  {
    q: "Do you deliver to my area?",
    a: (
      <>
        We serve Davangere and the area around it. Enter your pincode at
        checkout and the site tells you straight away whether we can deliver
        there. For anywhere else, call us and we&apos;ll see what we can arrange.
      </>
    ),
  },
  {
    q: "How soon will my materials be delivered?",
    a: (
      <>
        Usually the same day your order is confirmed, where stock is available,
        or on the date you choose when ordering. See our{" "}
        {link("/shipping-policy", "Shipping & Delivery Policy")}.
      </>
    ),
  },
  {
    q: "Can I cancel an order or a labour booking?",
    a: (
      <>
        Materials can be cancelled before dispatch. Labour can be cancelled free
        more than 24 hours before the start time. Details are in our{" "}
        {link("/refund-policy", "Refund & Cancellation Policy")}.
      </>
    ),
  },
  {
    q: "How long do refunds take?",
    a: (
      <>
        We start a refund within 3 working days of approving it, and it usually
        reaches you in 5&ndash;7 working days, depending on your bank.
      </>
    ),
  },
  {
    q: "Is a labour booking confirmed straight away?",
    a: (
      <>
        No. Your booking is a request until our team calls or messages you to
        confirm the details. See the {link("/labour-terms", "Labour Service Terms")}.
      </>
    ),
  },
  {
    q: "How do engineering quotes work?",
    a: (
      <>
        Send a quote request. It is free and has no obligation. Our team
        contacts you, and the quote we send is valid for 30 days. See the{" "}
        {link("/engineering-terms", "Engineering Services Terms")}.
      </>
    ),
  },
  {
    q: "Do I get a GST invoice?",
    a: <>A tax invoice is issued for every order, with GST shown separately.</>,
  },
]

/**
 * Collapsible "Common questions" under the Contact form — a stopgap in place
 * of a full FAQ page until real customer questions are known. Native
 * <details> keeps it accessible and JS-free.
 */
const CommonQuestions = () => {
  return (
    <div
      className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 small:p-8"
      data-testid="common-questions"
    >
      <Heading level="h2" className="text-2xl font-bold text-gray-900">
        Common questions
      </Heading>
      <Text className="text-ui-fg-subtle mt-1 mb-4">
        Quick answers before you write to us.
      </Text>
      <div className="divide-y divide-gray-200 border-t border-gray-200">
        {questions.map(({ q, a }) => (
          <details key={q} className="group py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-gray-900">
              {q}
              <span
                aria-hidden
                className="text-brand-600 transition-transform group-open:rotate-45 text-xl leading-none"
              >
                +
              </span>
            </summary>
            <div className="mt-2 text-gray-700 leading-relaxed">{a}</div>
          </details>
        ))}
      </div>
    </div>
  )
}

export default CommonQuestions
