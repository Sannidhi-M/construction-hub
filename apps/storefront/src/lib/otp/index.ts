import { precheckPhoneOtp, verifyPhoneOtp } from "@lib/data/customer"
import type { CustomerAuthState } from "@lib/data/customer"
import { firebaseOtpDriver } from "./firebase-driver"
import { serverOtpDriver } from "./server-driver"
import { OtpDriver, OtpError } from "./types"

/**
 * The one place the delivery service is chosen. Must agree with the
 * backend's PHONE_OTP_PROVIDER; see ./types.ts for how to add one.
 */
const driver: OtpDriver =
  process.env.NEXT_PUBLIC_PHONE_OTP_PROVIDER === "firebase"
    ? firebaseOtpDriver
    : serverOtpDriver

type SendOptions = {
  requireExistingAccount?: boolean
  signupEmail?: string
}

/**
 * Step 1 of every phone login/signup form: run the pre-OTP checks (email
 * already taken, account must exist) on the server, and only then have the
 * driver send the code — so a visitor who'd be refused is never texted.
 */
export async function sendPhoneOtp(
  phone: string,
  options: SendOptions = {}
): Promise<CustomerAuthState> {
  const check = await precheckPhoneOtp(
    phone,
    options.requireExistingAccount,
    options.signupEmail
  )
  if (check.state !== "ok") {
    return check
  }

  try {
    await driver.send(phone)
    return { state: "otp_sent", phone }
  } catch (error) {
    return {
      state: "error",
      error:
        error instanceof OtpError
          ? error.message
          : "Something went wrong sending the code. Please try again.",
    }
  }
}

/**
 * Step 2: turn the typed code into the driver's credential and log in with
 * it. Same result states as `verifyPhoneOtp`.
 */
export async function confirmPhoneOtp(
  phone: string,
  code: string
): Promise<CustomerAuthState> {
  let credential: string
  try {
    credential = await driver.confirm(phone, code)
  } catch (error) {
    return {
      state: "error",
      error: error instanceof OtpError ? error.message : "Incorrect OTP.",
    }
  }

  const formData = new FormData()
  formData.set("phone", phone)
  formData.set("credential", credential)
  return verifyPhoneOtp(null, formData)
}
