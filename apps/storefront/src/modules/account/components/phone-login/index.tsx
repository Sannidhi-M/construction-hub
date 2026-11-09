"use client"

import { confirmPhoneOtp, sendPhoneOtp } from "@lib/otp"
import type { CustomerAuthState } from "@lib/data/customer"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { Text } from "@modules/common/components/ui"
import { useEffect, useState, useTransition } from "react"

type Props = {
  onVerified?: () => void
  // Called when the OTP is valid but no customer exists for this phone yet.
  // What happens next is left to the caller — it differs by context (sign-in
  // sends them to Create Account; checkout auto-creates the account from the
  // shipping address already on the cart).
  onNewPhone?: (args: { phone: string; token: string }) => void | Promise<void>
  // When true, an OTP is only sent if the phone already has an account —
  // otherwise `onPhoneNotFound` fires and no OTP is sent at all. Sign In
  // sets this; checkout never does, since it lets a brand-new number sign
  // up inline.
  requireExistingAccount?: boolean
  onPhoneNotFound?: (phone: string) => void
  // Prefills the phone step, for callers that already collected the number
  // earlier in their own form (still editable).
  initialPhone?: string
  // The email this flow would create an account with if the phone is new.
  // When set, an OTP is NOT sent if that email already belongs to another
  // account — the visitor is told so immediately, not after entering a code.
  signupEmail?: string
}

/**
 * Phone/OTP verification — two steps (phone, OTP).
 */
const PhoneLogin = ({
  onVerified,
  onNewPhone,
  requireExistingAccount,
  onPhoneNotFound,
  initialPhone,
  signupEmail,
}: Props = {}) => {
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [creatingAccount, setCreatingAccount] = useState(false)

  const [requestState, setRequestState] = useState<CustomerAuthState>(null)
  const [verifyState, setVerifyState] = useState<CustomerAuthState>(null)
  const [, startTransition] = useTransition()

  // The OTP driver (lib/otp) talks to whichever service delivers the code
  // (Firebase, MSG91…), so these are plain async handlers, not server actions.
  const requestAction = (formData: FormData) =>
    startTransition(async () => {
      setRequestState(
        await sendPhoneOtp(formData.get("phone") as string, {
          requireExistingAccount: formData.get("require_existing") === "true",
          signupEmail: (formData.get("signup_email") as string) || undefined,
        })
      )
    })

  const verifyAction = (formData: FormData) =>
    startTransition(async () => {
      setVerifyState(
        await confirmPhoneOtp(
          formData.get("phone") as string,
          formData.get("otp") as string
        )
      )
    })

  useEffect(() => {
    if (requestState?.state === "otp_sent") {
      setPhone(requestState.phone)
      setStep("otp")
    } else if (requestState?.state === "not_found") {
      onPhoneNotFound?.(requestState.phone)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestState])

  useEffect(() => {
    if (verifyState?.state === "success") {
      onVerified?.()
    } else if (verifyState?.state === "email_required" && onNewPhone) {
      setCreatingAccount(true)
      Promise.resolve(
        onNewPhone({ phone: verifyState.phone, token: verifyState.token })
      ).finally(() => setCreatingAccount(false))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verifyState])

  if (creatingAccount) {
    return (
      <Text className="text-center text-small-regular text-ui-fg-subtle">
        Creating your account…
      </Text>
    )
  }

  if (step === "otp") {
    return (
      <form className="w-full" action={verifyAction}>
        <input type="hidden" name="phone" value={phone} />
        <Text className="text-center text-small-regular text-ui-fg-subtle mb-4">
          Enter the code sent to {phone}.
        </Text>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="OTP"
            name="otp"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            data-testid="otp-input"
          />
        </div>
        <ErrorMessage
          error={verifyState?.state === "error" ? verifyState.error : null}
          data-testid="otp-error-message"
        />
        <SubmitButton data-testid="verify-otp-button" className="w-full mt-6">
          Verify
        </SubmitButton>
        <button
          type="button"
          onClick={() => setStep("phone")}
          className="text-center text-ui-fg-subtle text-small-regular underline w-full mt-4"
          data-testid="change-phone-button"
        >
          Use a different number
        </button>
      </form>
    )
  }

  return (
    <form className="w-full" action={requestAction}>
      {requireExistingAccount && (
        <input type="hidden" name="require_existing" value="true" />
      )}
      {signupEmail && (
        <input type="hidden" name="signup_email" value={signupEmail} />
      )}
      <div className="flex flex-col w-full gap-y-2">
        <Input
          label="Phone number"
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          required
          maxLength={10}
          defaultValue={initialPhone}
          onChange={(e) => {
            e.target.value = e.target.value.replace(/\D/g, "").slice(0, 10)
          }}
          data-testid="phone-input"
        />
      </div>
      <ErrorMessage
        error={requestState?.state === "error" ? requestState.error : null}
        data-testid="phone-error-message"
      />
      <SubmitButton data-testid="send-otp-button" className="w-full mt-6">
        Send OTP
      </SubmitButton>
    </form>
  )
}

export default PhoneLogin
