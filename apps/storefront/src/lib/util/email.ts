// Same shape the backend enforces (Medusa's own customer-creation
// validator, and create-quote-request.ts). Needed client-side because the
// booking/quote forms submit from an onClick handler rather than a native
// <form> submit, so the browser's own type="email" check never runs there —
// a bad email would otherwise only fail deep in the flow, at new-phone
// signup.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Shown when an email would stop a new phone number becoming an account —
// the same wording wherever the pre-OTP check (emailBlocksSignup) trips.
export const EMAIL_TAKEN_MESSAGE =
  "This email is already registered to another account. Please use a different email, or enter the phone number linked to that account."

export const isValidEmail = (value: string) => EMAIL_PATTERN.test(value.trim())
