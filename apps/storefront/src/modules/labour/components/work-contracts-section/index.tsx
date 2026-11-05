import { ChevronRight } from "@medusajs/icons"
import { Button, Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const STEPS = [
  {
    title: "Tell us about the work",
    text: "Which trade, how big the job is, and where it is.",
  },
  {
    title: "We assess it",
    text: "We check the size of the work and how many days it will take.",
  },
  {
    title: "Agree a price",
    text: "We settle on flexible pricing and terms that work for both sides.",
  },
]

/**
 * "Complete Work Contracts" — the alternative to booking workers by the day
 * or hour: hand over a whole job (all the painting, all the carpentry…) under
 * one contract. There's no online booking for this, because the price depends
 * on the size and duration of the work, which we agree by talking; so the one
 * action is the Contact page, opened with the Labour subject already chosen.
 * A light orange-tinted panel under the booking cards, so it reads as a
 * different kind of offer from them, not one more card.
 */
const WorkContractsSection = () => (
  <section
    className="mt-12 grid grid-cols-1 medium:grid-cols-2 gap-8 medium:gap-12 rounded-large border border-brand-100 bg-brand-50 p-6 small:p-10 text-gray-900"
    data-testid="work-contracts-section"
  >
    <div className="flex flex-col items-start">
      <Text className="text-brand-600 txt-small-plus uppercase tracking-wide mb-2">
        Have a bigger job?
      </Text>
      <Heading level="h2" className="text-3xl small:text-4xl font-bold leading-tight">
        Complete Work Contracts
      </Heading>
      <Text className="text-gray-600 mt-3">
        Get your entire work done through a single contract! From painting and
        tiling to carpentry, masonry, plumbing and more. We undertake complete
        work contracts with flexible pricing and mutually agreed terms.
      </Text>

      <LocalizedClientLink href="/contact?subject=labour" className="mt-8">
        <Button variant="primary" size="large" data-testid="work-contracts-contact-button">
          Contact us
          <ChevronRight />
        </Button>
      </LocalizedClientLink>
    </div>

    <div className="flex flex-col justify-center">
      <Text className="txt-small-plus uppercase tracking-wide text-gray-500 mb-4">
        How it works
      </Text>
      <ol className="flex flex-col gap-y-4">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="flex items-start gap-x-4 rounded-lg bg-white border border-gray-200 shadow-sm p-4"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 font-bold text-white">
              {index + 1}
            </span>
            <div>
              <Text className="font-semibold text-gray-900">{step.title}</Text>
              <Text className="text-gray-600 txt-small mt-0.5">{step.text}</Text>
            </div>
          </li>
        ))}
      </ol>
    </div>
  </section>
)

export default WorkContractsSection
