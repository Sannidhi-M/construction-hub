"use client"

import { completePhoneSignup, requestPhoneOtp, verifyPhoneOtp } from "@lib/data/customer"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { Text } from "@modules/common/components/ui"
import { useActionState, useEffect, useState } from "react"

/**
 * Phone/OTP login — a single unified flow for both new and returning
 * customers (§3.1/§4.2). There's no separate "register with phone" screen:
 * requesting an OTP works the same either way. A returning customer is
 * logged in as soon as the OTP is verified; a brand-new phone number gets
 * one more step asking for email (Medusa requires it to create a customer
 * account, and the business wants it collected for shipping/invoicing
 * regardless of signup method).
 */
const PhoneLogin = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const [step, setStep] = useState<"phone" | "otp" | "email">("phone")
  const [phone, setPhone] = useState("")
  const [pendingToken, setPendingToken] = useState("")

  const [requestState, requestAction] = useActionState(requestPhoneOtp, null)
  const [verifyState, verifyAction] = useActionState(verifyPhoneOtp, null)
  const [signupState, signupAction] = useActionState(completePhoneSignup, null)

  useEffect(() => {
    if (requestState?.state === "otp_sent") {
      setPhone(requestState.phone)
      setStep("otp")
    }
  }, [requestState])

  useEffect(() => {
    if (verifyState?.state === "email_required") {
      setPendingToken(verifyState.token)
      setStep("email")
    } else if (verifyState?.state === "success") {
      onSuccess?.()
    }
  }, [verifyState, onSuccess])

  useEffect(() => {
    if (signupState?.state === "success") {
      onSuccess?.()
    }
  }, [signupState, onSuccess])

  if (step === "email") {
    return (
      <form className="w-full" action={signupAction}>
        <input type="hidden" name="phone" value={phone} />
        <input type="hidden" name="token" value={pendingToken} />
        <Text className="text-center text-small-regular text-ui-fg-subtle mb-4">
          Almost done — what&apos;s your email? We&apos;ll use it for order
          updates and invoices.
        </Text>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Email"
            name="email"
            type="email"
            title="Enter a valid email address."
            autoComplete="email"
            required
            data-testid="signup-email-input"
          />
        </div>
        <ErrorMessage
          error={signupState?.state === "error" ? signupState.error : null}
          data-testid="signup-email-error-message"
        />
        <SubmitButton data-testid="complete-signup-button" className="w-full mt-6">
          Continue
        </SubmitButton>
      </form>
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
      <div className="flex flex-col w-full gap-y-2">
        <Input
          label="Phone number"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
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
