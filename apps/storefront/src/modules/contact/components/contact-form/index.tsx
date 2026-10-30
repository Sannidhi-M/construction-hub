"use client"

import { FormEvent, useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { CheckCircleSolid, PaperPlane } from "@medusajs/icons"
import ErrorMessage from "@modules/checkout/components/error-message"
import Input from "@modules/common/components/input"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button, Heading, Text } from "@modules/common/components/ui"
import { contactTopics } from "@lib/data/contact-topics"
import { sendContactMessage } from "@lib/data/contact-messages"
import { isValidEmail } from "@lib/util/email"

type Field = "name" | "email" | "phone" | "topic" | "message"

// Mirrors the backend's limits (create-contact-message.ts), which are the
// authoritative ones.
const MIN_MESSAGE_LENGTH = 10
const MAX_MESSAGE_LENGTH = 2000

const digitsOnly = (value: string) => value.replace(/\D/g, "").slice(0, 10)

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
 * "Send us a message" form. Open to anyone — no sign-in or OTP — so it only
 * prefills from the account when there is one. Abuse is handled server-side
 * (per-IP rate limit, validation) plus the hidden honeypot field below.
 */
const ContactForm = ({ customer }: { customer: HttpTypes.StoreCustomer | null }) => {
  const [name, setName] = useState(
    customer ? `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim() : ""
  )
  const [email, setEmail] = useState(customer?.email ?? "")
  // Stored phones are "+91XXXXXXXXXX"; the field takes the 10 national digits.
  const [phone, setPhone] = useState(
    customer?.phone ? customer.phone.replace(/\D/g, "").slice(-10) : ""
  )
  const [topicSlug, setTopicSlug] = useState("")
  const [message, setMessage] = useState("")
  const [honeypot, setHoneypot] = useState("")
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

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
    if (phone.length !== 10) {
      next.phone = "Please enter a valid 10-digit phone number."
    }
    if (!topicSlug) {
      next.topic = "Please choose a subject."
    }
    if (message.trim().length < MIN_MESSAGE_LENGTH) {
      next.message = `Please write a message of at least ${MIN_MESSAGE_LENGTH} characters.`
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!validate()) {
      return
    }

    setSubmitting(true)
    setFormError(null)
    try {
      await sendContactMessage({
        topic_slug: topicSlug,
        name,
        email,
        phone,
        message,
        website: honeypot,
      })
      setSent(true)
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Couldn't send your message. Please try again."
      )
    } finally {
      setSubmitting(false)
    }
  }

  const sendAnother = () => {
    setTopicSlug("")
    setMessage("")
    setErrors({})
    setFormError(null)
    setSent(false)
  }

  if (sent) {
    return (
      <div
        className="h-full bg-white border border-gray-200 rounded-lg shadow-sm p-6 small:p-10 flex flex-col items-center justify-center text-center"
        data-testid="contact-success"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500 text-white mb-4">
          <CheckCircleSolid className="w-7 h-7" />
        </div>
        <Heading level="h2" className="text-2xl small:text-3xl font-bold text-gray-900">
          Message sent!
        </Heading>
        <Text className="text-gray-600 mt-2 max-w-md">
          Thank you{name.trim() ? `, ${name.trim().split(" ")[0]}` : ""}. We&apos;ve
          received your message and will get back to you as soon as possible.
        </Text>
        <div className="flex flex-wrap justify-center gap-3 mt-6">
          <Button variant="secondary" onClick={sendAnother}>
            Send another message
          </Button>
          <LocalizedClientLink href="/">
            <Button variant="secondary">Back to home</Button>
          </LocalizedClientLink>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="h-full bg-white border border-gray-200 rounded-lg shadow-sm p-6 small:p-8"
      data-testid="contact-form"
    >
      <Heading level="h2" className="text-2xl font-bold text-gray-900">
        Send us a message
      </Heading>
      <Text className="text-ui-fg-subtle mt-1 mb-6">
        Fill out the form below and we&apos;ll get back to you as soon as possible.
      </Text>

      <div className="grid grid-cols-1 small:grid-cols-2 gap-5">
        <div>
          <Input
            label="Full name"
            name="name"
            autoComplete="name"
            required
            invalid={!!errors.name}
            value={name}
            onChange={(e) => setName(e.target.value)}
            data-testid="contact-name-input"
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
            invalid={!!errors.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            data-testid="contact-email-input"
          />
          <FieldError message={errors.email} />
        </div>

        <div>
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
            data-testid="contact-phone-input"
          />
          <FieldError message={errors.phone} />
        </div>

        <div>
          <select
            id="contact-topic"
            name="topic"
            aria-label="Subject"
            value={topicSlug}
            onChange={(e) => setTopicSlug(e.target.value)}
            aria-invalid={!!errors.topic || undefined}
            className={`${fieldClass(!!errors.topic)} h-11`}
            data-testid="contact-topic-select"
          >
            <option value="">Select a subject *</option>
            {contactTopics.map((topic) => (
              <option key={topic.slug} value={topic.slug}>
                {topic.name}
              </option>
            ))}
          </select>
          <FieldError message={errors.topic} />
        </div>
      </div>

      <div className="mt-5">
        <label
          htmlFor="contact-message"
          className="block txt-compact-medium-plus text-ui-fg-base mb-1"
        >
          Message <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          rows={4}
          maxLength={MAX_MESSAGE_LENGTH}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          aria-invalid={!!errors.message || undefined}
          placeholder="Tell us how we can help…"
          className={`${fieldClass(!!errors.message)} py-3 resize-y`}
          data-testid="contact-message-input"
        />
        <div className="flex justify-between gap-4">
          <FieldError message={errors.message} />
          <Text className="text-ui-fg-subtle txt-small mt-1 ml-auto">
            {message.length}/{MAX_MESSAGE_LENGTH}
          </Text>
        </div>
      </div>

      {/* Honeypot: invisible and unreachable for real visitors, but bots that
          fill every field fill this too — the server silently discards those
          submissions. Positioned off-screen rather than display:none, which
          simple bots skip. */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <ErrorMessage error={formError} data-testid="contact-form-error" />

      <Button
        type="submit"
        size="large"
        isLoading={submitting}
        className="mt-6"
        data-testid="contact-submit-button"
      >
        <PaperPlane />
        Send Message
      </Button>
    </form>
  )
}

export default ContactForm
