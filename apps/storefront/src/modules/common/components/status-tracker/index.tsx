import { CheckCircleSolid } from "@medusajs/icons"
import { Text } from "@modules/common/components/ui"

export type TrackerStep = {
  key: string
  label: string
  hint: string
}

/**
 * A progress tracker for an Admin-driven lifecycle: a row of numbered steps
 * (a column on small screens, joined by a thin vertical line) with the reached
 * ones filled in. Shared by the
 * labour-booking and quote-request detail pages; each wrapper supplies its
 * own steps and decides what a non-linear end state (e.g. "cancelled") looks
 * like, since that isn't a step on the path.
 */
const StatusTracker = ({
  steps,
  currentIndex,
  testIdPrefix = "status",
}: {
  steps: TrackerStep[]
  currentIndex: number
  testIdPrefix?: string
}) => {
  return (
    <ol
      className="flex flex-col small:flex-row gap-4 small:gap-0"
      data-testid={`${testIdPrefix}-tracker`}
    >
      {steps.map((step, index) => {
        const reached = index <= currentIndex
        const isCurrent = index === currentIndex

        return (
          <li
            key={step.key}
            className="relative flex small:flex-1 small:flex-col items-start gap-3 small:gap-2"
            data-testid={`${testIdPrefix}-step-${step.key}`}
            aria-current={isCurrent ? "step" : undefined}
          >
            <div className="flex items-center small:w-full">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  reached
                    ? "bg-brand-500 text-white"
                    : "bg-gray-100 text-gray-400 border border-gray-200"
                }`}
              >
                {reached ? (
                  <CheckCircleSolid className="w-4 h-4" />
                ) : (
                  <span className="txt-small-plus">{index + 1}</span>
                )}
              </span>
              {index < steps.length - 1 && (
                <span
                  className={`hidden small:block h-0.5 flex-1 mx-2 ${
                    index < currentIndex ? "bg-brand-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
            {/* The thin line joining one step to the next in the stacked (phone)
                layout, so the list reads as a sequence. It runs from the bottom
                of this step's circle (28px) to the top of the next one, and is
                orange once that next step is reached. On wide screens the
                horizontal line above does the same job. */}
            {index < steps.length - 1 && (
              <span
                aria-hidden
                className={`small:hidden absolute left-[13px] top-7 -bottom-4 w-0.5 ${
                  index < currentIndex ? "bg-brand-500" : "bg-gray-200"
                }`}
              />
            )}
            <div className="flex flex-col pt-0.5 small:pt-0">
              <Text
                className={`txt-medium-plus ${
                  reached ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {step.label}
              </Text>
              <Text
                className={`txt-small ${
                  reached ? "text-ui-fg-subtle" : "text-gray-400"
                }`}
              >
                {step.hint}
              </Text>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export default StatusTracker
