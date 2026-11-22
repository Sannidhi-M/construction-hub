/**
 * The "we don't deliver there" message, shared by the checkout address form's
 * on-blur hint and the server action that enforces it on submit, so the two
 * can't drift apart — and so the form can recognise the server's refusal and
 * show it once, beside the postal code, instead of again under the button.
 */
export const notServiceableMessage = (pincode: string) =>
  `We don't currently deliver to pincode ${pincode}.`

export const isNotServiceableMessage = (message: unknown): message is string =>
  typeof message === "string" &&
  message.startsWith("We don't currently deliver to pincode")
