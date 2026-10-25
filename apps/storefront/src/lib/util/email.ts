// Same shape the backend enforces (Medusa's own customer-creation
// validator, and create-quote-request.ts). Needed client-side because the
// booking/quote forms submit from an onClick handler rather than a native
// <form> submit, so the browser's own type="email" check never runs there —
// a bad email would otherwise only fail deep in the flow, at new-phone
// signup.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const isValidEmail = (value: string) => EMAIL_PATTERN.test(value.trim())
