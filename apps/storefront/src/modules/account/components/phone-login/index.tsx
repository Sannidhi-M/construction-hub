"use client"

import { requestPhoneOtp, verifyPhoneOtp } from "@lib/data/customer"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { Text } from "@modules/common/components/ui"
import { useActionState, useEffect, useState } from "react"

type Props = {
  onVerified?: () => void
  // Called when the OTP is valid but no customer exists for this phone yet.
  // What happens next is left to the caller — it differs by context (sign-in
  // sends them to Create Account; checkout auto-creates the account from the
  // shipping address already on the cart).
  onNewPhone?: (args: { phone: string; token: string }) => void | Promise<void>
}

/**
 * Phone/OTP verification — two steps (phone, OTP).
 */
const PhoneLogin = ({ onVerified, onNewPhone }: Props = {}) => {
  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [phone, setPhone] = useState("")
  const [creatingAccount, setCreatingAccount] = useState(false)

  const [requestState, requestAction] = useActionState(requestPhoneOtp, null)
  const [verifyState, verifyAction] = useActionState(verifyPhoneOtp, null)

  useEffect(() => {
    if (requestState?.state === "otp_sent") {
      setPhone(requestState.phone)
      setStep("otp")
    }
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
