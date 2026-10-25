import { XCircleSolid } from "@medusajs/icons"
import { Text } from "@modules/common/components/ui"

/**
 * What a status tracker shows instead of its steps when the thing was
 * cancelled — cancellation isn't a step on the happy path, it's a terminal
 * exit from any point, so graying out the steps would misrepresent it.
 */
const CancelledNotice = ({
  message,
  testId,
}: {
  message: string
  testId?: string
}) => (
  <div
    className="flex items-center gap-x-3 bg-red-50 border border-red-100 rounded-md px-4 py-3"
    data-testid={testId}
  >
    <XCircleSolid className="w-5 h-5 text-red-500 shrink-0" />
    <Text className="text-red-700 txt-medium">{message}</Text>
  </div>
)

export default CancelledNotice
