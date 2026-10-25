type MedusaError = {
  response?: {
    data: { message?: string } | string
    status: number
    headers: unknown
  }
  request?: unknown
  message?: string
  config?: { url: string; baseURL: string }
  // Present on the v2 JS SDK's FetchError (see below).
  status?: number
}

// Capitalize, and end with a period unless the message already ends in
// punctuation (backend validation messages usually already do).
const toSentence = (message: string) => {
  const capitalized = message.charAt(0).toUpperCase() + message.slice(1)
  return /[.!?]$/.test(capitalized) ? capitalized : capitalized + "."
}

export default function medusaError(error: unknown): never {
  const err = error as MedusaError
  if (err.response) {
    const u = new URL(err.config?.url ?? "", err.config?.baseURL ?? "")
    console.error("Resource:", u.toString())
    console.error("Response data:", err.response.data)
    console.error("Status code:", err.response.status)
    console.error("Headers:", err.response.headers)

    const data = err.response.data
    const message =
      typeof data === "object" && data !== null
        ? data.message || String(data)
        : data

    throw new Error(message.charAt(0).toUpperCase() + message.slice(1) + ".")
  } else if (typeof err.status === "number" && err.message) {
    // The v2 JS SDK's FetchError — which is what `sdk.client.fetch` throws
    // for any non-2xx response — has no `response`/`request` (those were
    // the older axios-style error shape this util was written for), so it
    // used to fall through to the last branch and every server message
    // came out as "Error setting up the request: <message>". Its `message`
    // is already the server's own, so surface it as-is.
    throw new Error(toSentence(err.message))
  } else if (err.request) {
    throw new Error("No response received: " + String(err.request))
  } else {
    throw new Error("Error setting up the request: " + err.message)
  }
}
