import { ExclamationCircle } from "@medusajs/icons"

type ErrorMessageProps = {
  error?: string | null
  "data-testid"?: string
  // "text" (default): small red text under a field, as used across checkout
  // and the account pages. "banner": a larger message in a tinted box, for
  // errors that must not be missed — e.g. why a booking can't continue.
  variant?: "text" | "banner"
}

const ErrorMessage = ({
  error,
  "data-testid": dataTestid,
  variant = "text",
}: ErrorMessageProps) => {
  if (!error) {
    return null
  }

  if (variant === "banner") {
    return (
      <div
        role="alert"
        className="mt-3 flex items-start gap-x-3 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-base font-medium text-rose-700"
        data-testid={dataTestid}
      >
        <ExclamationCircle className="mt-0.5 shrink-0" />
        <span>{error}</span>
      </div>
    )
  }

  return (
    <div className="pt-2 text-rose-500 text-small-regular" data-testid={dataTestid}>
      <span>{error}</span>
    </div>
  )
}

export default ErrorMessage
