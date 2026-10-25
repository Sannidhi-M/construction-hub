import { Text } from "@modules/common/components/ui"

/**
 * A "Label: value" line for the info cards at the top of detail pages
 * (labour booking, quote request). `highlight` makes the value brand-colored
 * — used for the reference number.
 */
const DetailField = ({
  label,
  value,
  highlight,
  testId,
}: {
  label: string
  value: string
  highlight?: boolean
  testId?: string
}) => (
  <Text className="break-words">
    <span className="txt-small text-ui-fg-subtle">{label}: </span>
    <span
      className={highlight ? "font-semibold text-brand-600" : "font-semibold text-gray-900"}
      data-testid={testId}
    >
      {value}
    </span>
  </Text>
)

export default DetailField
