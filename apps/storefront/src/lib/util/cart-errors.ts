/**
 * Cart actions throw for unexpected failures, but an over-order is an expected
 * answer a shopper can fix, so it is returned as a message instead. (A thrown
 * error from a server action is a 500 in the browser, and in production Next
 * replaces its text with a generic one.)
 *
 * The SDK's error carries only the server's message and status, not its
 * `insufficient_inventory` code, so this recognises the message text.
 */
export const OUT_OF_STOCK_MESSAGE =
  "Sorry, we don't have that much in stock. Please choose a smaller quantity."

export const isOutOfStockError = (error: unknown): boolean =>
  error instanceof Error && /required inventory/i.test(error.message)
