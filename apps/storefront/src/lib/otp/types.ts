/**
 * A phone-OTP "driver" is the browser-side half of proving someone owns a
 * phone number. Two steps, whatever the delivery service:
 *
 *   send(phone)          -> the user gets a code
 *   confirm(phone, code) -> a `credential` the backend can verify
 *
 * The backend's phone-otp-auth provider (apps/backend/src/modules/
 * phone-otp-auth) checks that credential in the matching "mode". To switch
 * delivery service (Firebase -> MSG91, say): pick the other driver with
 * NEXT_PUBLIC_PHONE_OTP_PROVIDER and the backend with PHONE_OTP_PROVIDER. To
 * add a service: implement this interface, register it in ./index.ts, add
 * the matching mode to the backend provider. Nothing in the UI changes.
 */
export interface OtpDriver {
  /** Starts the challenge. `phone` is whatever the user typed (10 digits). */
  send(phone: string): Promise<void>
  /** Checks the code; resolves to the credential to hand the backend. */
  confirm(phone: string, code: string): Promise<string>
}

/** An error whose message is safe to show the user as-is. */
export class OtpError extends Error {}
