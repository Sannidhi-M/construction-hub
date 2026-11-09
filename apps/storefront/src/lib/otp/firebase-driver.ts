import { normalizeIndianPhone } from "@lib/util/phone"
import type { ConfirmationResult, RecaptchaVerifier } from "firebase/auth"
import { OtpDriver, OtpError } from "./types"

/**
 * "firebase" mode: Firebase Phone Auth texts the code and checks it in the
 * browser. The credential handed to the backend is the Firebase ID token,
 * which the backend verifies against Google's public keys.
 *
 * Firebase is imported lazily so visitors on "server" mode (or who never
 * reach a login form) don't download it. Config is the public web-app config
 * from Firebase console -> Project settings -> Your apps.
 */

const FRIENDLY_ERRORS: Record<string, string> = {
  "auth/invalid-phone-number": "That phone number doesn't look right.",
  "auth/missing-phone-number": "Please enter your phone number.",
  "auth/too-many-requests":
    "Too many attempts from this device. Please try again later.",
  "auth/quota-exceeded":
    "We can't send codes right now. Please try again later.",
  "auth/captcha-check-failed":
    "Couldn't verify you're not a robot. Please refresh and try again.",
  "auth/invalid-verification-code": "Incorrect OTP.",
  "auth/code-expired": "OTP has expired. Please request a new one.",
  "auth/operation-not-allowed":
    "Firebase isn't set up to send SMS here yet (phone sign-in off, or India not allowed in the SMS region policy).",
  "auth/billing-not-enabled":
    "Firebase needs billing enabled to send real SMS. Use a test phone number, or upgrade the plan.",
  "auth/app-not-authorized":
    "This website isn't authorized for the Firebase project (check the API key and authorized domains).",
  "auth/invalid-app-credential":
    "Couldn't verify this browser with Firebase. Please refresh and try again.",
  "auth/network-request-failed":
    "Network problem. Check your connection and try again.",
}

function toOtpError(error: unknown): OtpError {
  const code = (error as { code?: string })?.code
  console.warn("[firebase otp]", error)
  return new OtpError(
    (code && FRIENDLY_ERRORS[code]) ||
      `Something went wrong sending the code. Please try again.${
        process.env.NODE_ENV === "development" && code ? ` (${code})` : ""
      }`
  )
}

async function getFirebaseAuth() {
  const { getApp, getApps, initializeApp } = await import("firebase/app")
  const { getAuth } = await import("firebase/auth")

  const app = getApps().length
    ? getApp()
    : initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      })
  return getAuth(app)
}

let recaptcha: RecaptchaVerifier | null = null
let confirmation: ConfirmationResult | null = null

export const firebaseOtpDriver: OtpDriver = {
  async send(phone) {
    const e164 = normalizeIndianPhone(phone)
    if (!e164) {
      throw new OtpError("Enter a valid 10-digit mobile number.")
    }

    try {
      const auth = await getFirebaseAuth()
      const { RecaptchaVerifier, signInWithPhoneNumber } = await import(
        "firebase/auth"
      )

      // Invisible reCAPTCHA needs a DOM node; a verifier is single-use after
      // a failure, so it's rebuilt below whenever one happens.
      if (!recaptcha) {
        const container = document.createElement("div")
        document.body.appendChild(container)
        recaptcha = new RecaptchaVerifier(auth, container, { size: "invisible" })
      }
      confirmation = await signInWithPhoneNumber(auth, e164, recaptcha)
    } catch (error) {
      recaptcha?.clear()
      recaptcha = null
      throw toOtpError(error)
    }
  },

  async confirm(_phone, code) {
    if (!confirmation) {
      throw new OtpError("Please request a new OTP.")
    }
    try {
      const { signOut } = await import("firebase/auth")
      const result = await confirmation.confirm(code)
      const idToken = await result.user.getIdToken()
      // Firebase's own session isn't used — Medusa owns the login. Drop it.
      await signOut(await getFirebaseAuth())
      confirmation = null
      return idToken
    } catch (error) {
      throw toOtpError(error)
    }
  },
}
