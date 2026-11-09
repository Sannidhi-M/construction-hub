"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { completePhoneSignup } from "@lib/data/customer"
import { confirmPhoneOtp, sendPhoneOtp } from "@lib/otp"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import Input from "@modules/common/components/input"
import { Button, Text } from "@modules/common/components/ui"
import { splitFullName } from "@lib/util/split-full-name"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const CreateAccount = ({ setCurrentView }: Props) => {
  const router = useRouter()
  const [step, setStep] = useState<"details" | "otp">("details")
  const [fullName, setFullName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGetOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    // Refuses before sending the OTP if this email already has an account.
    const result = await sendPhoneOtp(phone, { signupEmail: email })

    setSubmitting(false)
    if (result?.state === "otp_sent") {
      setStep("otp")
    } else if (result?.state === "error") {
      setError(result.error)
    }
  }

  // A returning customer who mistakenly used "Create account" with a phone
  // that already has one just gets signed in on their existing account —
  // the name/email they typed here are discarded, matching the sign-in
  // flow's own behavior for a recognized phone.
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const verifyResult = await confirmPhoneOtp(phone, otp)

    if (verifyResult?.state === "error") {
      setSubmitting(false)
      setError(verifyResult.error)
      return
    }

    if (verifyResult?.state === "success") {
      setSubmitting(false)
      router.refresh()
      return
    }

    if (verifyResult?.state === "email_required") {
      const { firstName, lastName } = splitFullName(fullName)
      const signupFormData = new FormData()
      signupFormData.set("phone", verifyResult.phone)
      signupFormData.set("token", verifyResult.token)
      signupFormData.set("email", email)
      signupFormData.set("first_name", firstName)
      signupFormData.set("last_name", lastName)
      const signupResult = await completePhoneSignup(null, signupFormData)

      setSubmitting(false)
      if (signupResult?.state === "error") {
        setError(signupResult.error)
      } else {
        router.refresh()
      }
      return
    }

    setSubmitting(false)
  }

  if (step === "otp") {
    return (
      <div
        className="max-w-sm w-full flex flex-col items-center"
        data-testid="create-account-otp-page"
      >
        <h1 className="text-large-semi uppercase mb-6">Verify your phone</h1>
        <form className="w-full" onSubmit={handleVerify}>
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
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              data-testid="create-account-otp-input"
            />
          </div>
          <ErrorMessage error={error} data-testid="create-account-otp-error" />
          <Button
            type="submit"
            isLoading={submitting}
            className="w-full mt-6"
            data-testid="create-account-verify-button"
          >
            Verify &amp; create account
          </Button>
          <button
            type="button"
            onClick={() => setStep("details")}
            className="text-center text-ui-fg-subtle text-small-regular underline w-full mt-4"
            data-testid="change-phone-button"
          >
            Use a different number
          </button>
        </form>
      </div>
    )
  }

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="text-large-semi uppercase mb-6">Create Account</h1>
      <form className="w-full flex flex-col" onSubmit={handleGetOtp}>
        <div className="flex flex-col w-full gap-y-2">
          <Input
            label="Full name"
            name="full_name"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            data-testid="full-name-input"
          />
          <Input
            label="Phone number"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            required
            maxLength={10}
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
            data-testid="create-account-phone-input"
          />
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="create-account-email-input"
          />
        </div>
        <ErrorMessage error={error} data-testid="create-account-error" />
        <Button
          type="submit"
          isLoading={submitting}
          className="w-full mt-6"
          data-testid="get-otp-button"
        >
          Get OTP
        </Button>
      </form>
      <span className="text-center text-ui-fg-base text-small-regular mt-6">
        Already a member?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          Sign in
        </button>
        .
      </span>
    </div>
  )
}

export default CreateAccount
