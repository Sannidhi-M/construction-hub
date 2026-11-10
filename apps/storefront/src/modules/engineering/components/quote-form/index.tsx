"use client"

import { FormEvent, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { CheckCircleSolid } from "@medusajs/icons"
import PhoneLogin from "@modules/account/components/phone-login"
import ErrorMessage from "@modules/checkout/components/error-message"
import Input from "@modules/common/components/input"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button, Heading, Text } from "@modules/common/components/ui"
import { EngineeringService } from "@lib/data/engineering-services"
import { createQuoteRequest } from "@lib/data/quote-requests"
import { completePhoneSignup, emailBlocksSignup } from "@lib/data/customer"
import { EMAIL_TAKEN_MESSAGE, isValidEmail } from "@lib/util/email"
import { splitFullName } from "@lib/util/split-full-name"

type Step = "form" | "verify" | "done"
type Field = "name" | "email" | "phone" | "service"
type Submitted = { id: string; phone: string; serviceName: string }

const MAX_NOTES_LENGTH = 1000

const digitsOnly = (value: string) => value.replace(/\D/g, "").slice(0, 10)

// Medusa's raw "already has an account" text is accurate but doesn't tell
// the visitor what to do about it.
const friendlyError = (message: string) =>
  /already has an account/i.test(message)
    ? "That email is already registered to another account. Please use a different email, or verify with the phone number linked to that account."
    : message

const fieldClass = (invalid: boolean) =>
  `block w-full px-4 border rounded-md txt-compact-medium focus:outline-none focus:ring-0 focus:shadow-borders-interactive-with-active ${
    invalid
      ? "bg-rose-50 border-rose-500"
      : "bg-ui-bg-field border-ui-border-base hover:bg-ui-bg-field-hover"
  }`

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <Text className="text-rose-500 txt-small mt-1">{message}</Text>
  ) : null

/**
 * "Get a free quote" form. Fill in the details → (if not already signed in)
 * verify the phone by OTP → the request is submitted automatically → thank-
 * you message. The stored phone is always the verified customer's own, taken
 * server-side, so the phone shown/typed here is never trusted as-is.
 */
const QuoteForm = ({
  customer,
  services,
  freeClaim = false,
}: {
  customer: HttpTypes.StoreCustomer | null
  // The picklist — differs between the Engineering Services and Other
  // Services forms (see lib/data/engineering-services.ts).
  services: EngineeringService[]
  // Claiming the one free service: the picklist is the free services only and
  // the request is flagged so the backend applies the one-per-customer rule.
  freeClaim?: boolean
}) => {
  const [step, setStep] = useState<Step>("form")
  const [name, setName] = useState(
    customer ? `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim() : ""
  )
  const [email, setEmail] = useState(customer?.email ?? "")
  const [phone, setPhone] = useState("")
  const [serviceSlug, setServiceSlug] = useState("")
  const [notes, setNotes] = useState("")
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [creatingAccount, setCreatingAccount] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [submitted, setSubmitted] = useState<Submitted | null>(null)

  // Signed in via email/password with no phone on file: there's no verified
  // number to attach, and verifying one from here would sign them into a
  // different identity — so send them to add it to their profile instead.
  const missingAccountPhone = !!customer && !customer.phone

  // A signed-in customer's request carries the name and email on their
  // account (the server decides that, see create-quote-request.ts), so those
  // fields are shown read-only rather than editable-but-ignored. Only a
  // detail the account actually has is locked; a missing one stays typeable.
  const accountName = customer
    ? `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim()
    : ""
  const nameLocked = !!accountName
  const emailLocked = !!customer?.email

  const validate = () => {
    const next: Partial<Record<Field, string>> = {}
    if (!name.trim()) {
      next.name = "Please enter your name."
    }
    if (!email.trim()) {
      next.email = "Please enter your email address."
    } else if (!isValidEmail(email)) {
      next.email = "Please enter a valid email address."
    }
    if (!customer && phone.length !== 10) {
      next.phone = "Please enter a valid 10-digit phone number."
    }
    if (!serviceSlug) {
      next.service = "Please choose a service."
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = async () => {
    setSubmitting(true)
    setFormError(null)
    try {
      const quoteRequest = await createQuoteRequest({
        service_slug: serviceSlug,
        name,
        email,
        notes: notes.trim() || undefined,
        claim_free: freeClaim || undefined,
      })
      setSubmitted({
        id: quoteRequest.id,
        phone: quoteRequest.phone,
        serviceName: quoteRequest.service_name,
      })
      setStep("done")
    } catch (err) {
      setFormError(
        friendlyError(err instanceof Error ? err.message : "Couldn't submit your request")
      )
      setStep("form")
    } finally {
      setSubmitting(false)
    }
  }

  const handleFormSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) {
      return
    }
    if (customer) {
      void submit()
      return
    }

    // A new phone number becomes an account using this email, which fails if
    // another account already has it. Find that out now, before an OTP is
    // sent, rather than after the visitor has entered one.
    setFormError(null)
    setCheckingEmail(true)
    const emailTaken = await emailBlocksSignup(email.trim(), phone)
    setCheckingEmail(false)
    if (emailTaken) {
      setErrors({ email: EMAIL_TAKEN_MESSAGE })
      return
    }
    setStep("verify")
  }

  // A brand-new phone's OTP verified but there's no customer for it yet —
  // create the account from the name/email already typed above (same as the
  // booking modal and checkout), then submit.
  const handleNewPhone = async ({
    phone: verifiedPhone,
    token,
  }: {
    phone: string
    token: string
  }) => {
    setCreatingAccount(true)
    const { firstName, lastName } = splitFullName(name)
    const formData = new FormData()
    formData.set("phone", verifiedPhone)
    formData.set("token", token)
    formData.set("email", email)
    formData.set("first_name", firstName)
    formData.set("last_name", lastName)

    const result = await completePhoneSignup(null, formData)
    setCreatingAccount(false)

    if (result?.state === "error") {
      setFormError(friendlyError(result.error))
      setStep("form")
      return
    }

    await submit()
  }

  if (step === "done" && submitted) {
    return (
      <div
        className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 small:p-10 flex flex-col items-center text-center"
        data-testid="quote-success"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white mb-4">
          <CheckCircleSolid className="w-7 h-7" />
        </div>
        <Heading level="h2" className="text-2xl small:text-3xl font-bold text-gray-900">
          Thank you!
        </Heading>
        <Text className="text-gray-600 mt-2 max-w-md">
          We&apos;ve received your {freeClaim ? "free service claim" : "quote request"} for{" "}
          <span className="font-semibold text-gray-900">{submitted.serviceName}</span>.
          Our team will call you back shortly on{" "}
          <span className="font-semibold text-gray-900">{submitted.phone}</span>.
        </Text>
        <Text className="txt-small text-ui-fg-subtle mt-4">
          Reference: <span className="font-semibold">#{submitted.id.slice(-8).toUpperCase()}</span>
        </Text>
        <LocalizedClientLink href="/" className="mt-6">
          <Button variant="secondary">Back to home</Button>
        </LocalizedClientLink>
      </div>
    )
  }

  if (step === "verify") {
    return (
      <div
        className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 small:p-10"
        data-testid="quote-verify-step"
      >
        {creatingAccount || submitting ? (
          <Text className="text-center text-small-regular text-ui-fg-subtle py-8">
            {creatingAccount ? "Creating your account…" : "Submitting your request…"}
          </Text>
        ) : (
          <>
            <Heading level="h2" className="text-xl font-semibold text-gray-900">
              Verify your phone number
            </Heading>
            <Text className="text-ui-fg-subtle mt-1 mb-6">
              We&apos;ll send a one-time code so we know the number we&apos;ll
              call back on is yours.
            </Text>
            <PhoneLogin
              initialPhone={phone}
              signupEmail={email.trim()}
              onVerified={submit}
              onNewPhone={handleNewPhone}
            />
            <button
              type="button"
              onClick={() => setStep("form")}
              className="text-center text-ui-fg-subtle text-small-regular underline w-full mt-4"
              data-testid="quote-edit-details-button"
            >
              Edit my details
            </button>
          </>
        )}
      </div>
    )
  }

  return (
    <form
      onSubmit={handleFormSubmit}
      noValidate
      className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 small:p-10 flex flex-col gap-y-5"
      data-testid="quote-form"
    >
      <div>
        <Input
          label="Full name"
          name="name"
          autoComplete="name"
          required
          readOnly={nameLocked}
          invalid={!!errors.name}
          value={name}
          onChange={(e) => setName(e.target.value)}
          data-testid="quote-name-input"
        />
        <FieldError message={errors.name} />
      </div>

      <div>
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          readOnly={emailLocked}
          invalid={!!errors.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          data-testid="quote-email-input"
        />
        <FieldError message={errors.email} />
        {(nameLocked || emailLocked) && (
          <Text className="text-ui-fg-subtle txt-small mt-1">
            Taken from your account.{" "}
            <LocalizedClientLink href="/account/profile" className="underline">
              Update in your profile
            </LocalizedClientLink>
          </Text>
        )}
      </div>

      <div>
        {customer ? (
          <>
            <Input
              label="Phone number"
              name="phone"
              type="tel"
              readOnly
              value={customer.phone ?? ""}
              data-testid="quote-phone-input"
            />
            {missingAccountPhone ? (
              <Text className="text-rose-500 txt-small mt-1">
                Your account has no verified phone number.{" "}
                <LocalizedClientLink href="/account/profile" className="underline">
                  Add one in your profile
                </LocalizedClientLink>{" "}
                to request a quote.
              </Text>
            ) : (
              <Text className="text-green-600 txt-small mt-1">
                ✓ Verified — we&apos;ll call you on this number.
              </Text>
            )}
          </>
        ) : (
          <>
            <Input
              label="Phone number"
              name="phone"
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={10}
              required
              invalid={!!errors.phone}
              value={phone}
              onChange={(e) => setPhone(digitsOnly(e.target.value))}
              data-testid="quote-phone-input"
            />
            <FieldError message={errors.phone} />
            {!errors.phone && (
              <Text className="text-ui-fg-subtle txt-small mt-1">
                We&apos;ll verify this number with a one-time code when you submit.
              </Text>
            )}
          </>
        )}
      </div>

      <div>
        <label
          htmlFor="quote-service"
          className="block txt-compact-medium-plus text-ui-fg-base mb-1"
        >
          Service <span className="text-rose-500">*</span>
        </label>
        <select
          id="quote-service"
          name="service"
          value={serviceSlug}
          onChange={(e) => setServiceSlug(e.target.value)}
          aria-invalid={!!errors.service || undefined}
          className={`${fieldClass(!!errors.service)} h-11`}
          data-testid="quote-service-select"
        >
          <option value="">Select a service</option>
          {services.map((service) => (
            <option key={service.slug} value={service.slug}>
              {service.name}
            </option>
          ))}
        </select>
        <FieldError message={errors.service} />
      </div>

      <div>
        <label
          htmlFor="quote-notes"
          className="block txt-compact-medium-plus text-ui-fg-base mb-1"
        >
          Other notes <span className="text-ui-fg-subtle font-normal">(optional)</span>
        </label>
        <textarea
          id="quote-notes"
          name="notes"
          rows={4}
          maxLength={MAX_NOTES_LENGTH}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={
            serviceSlug === "other"
              ? "Please describe the service you need, along with plot size, location and anything else we should know."
              : "Tell us about your project — plot size, location, anything else we should know."
          }
          className={`${fieldClass(false)} py-3 resize-y`}
          data-testid="quote-notes-input"
        />
        <Text className="text-ui-fg-subtle txt-small mt-1 text-right">
          {notes.length}/{MAX_NOTES_LENGTH}
        </Text>
      </div>

      <ErrorMessage error={formError} data-testid="quote-form-error" />

      <Button
        type="submit"
        size="large"
        isLoading={submitting || checkingEmail}
        disabled={missingAccountPhone}
        className="w-full"
        data-testid="quote-submit-button"
      >
        {freeClaim ? "Claim my free service" : "Submit"}
      </Button>
    </form>
  )
}

export default QuoteForm
