"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import Modal from "@modules/common/components/modal"
import PhoneLogin from "@modules/account/components/phone-login"
import ErrorMessage from "@modules/checkout/components/error-message"
import Input from "@modules/common/components/input"
import { Button, Heading, Text } from "@modules/common/components/ui"
import { LabourService } from "@lib/data/labour-services"
import { createLabourBooking } from "@lib/data/labour-bookings"
import { completePhoneSignup, emailBlocksSignup } from "@lib/data/customer"
import { checkPincodeServiceable } from "@lib/data/delivery-area"
import { MAX_WORKERS_PER_BOOKING } from "@lib/util/labour-booking"
import { splitFullName } from "@lib/util/split-full-name"
import { EMAIL_TAKEN_MESSAGE, isValidEmail } from "@lib/util/email"
import { convertToLocale } from "@lib/util/money"
import SavedAddressPicker from "@modules/checkout/components/saved-address-picker"

type RateType = "day" | "hour"
type PaymentChoice = "upi" | "cod"
type Step = "details" | "verify" | "payment"

const toIsoDate = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

// Same 8:30 AM same-day cutoff as the backend's authoritative check — this
// is a fast UX hint only, not the real gate (see create-labour-booking.ts).
const earliestDayDate = () => {
  const now = new Date()
  const today = toIsoDate(now)
  const pastCutoff = now.getHours() > 8 || (now.getHours() === 8 && now.getMinutes() >= 30)
  if (!pastCutoff) {
    return today
  }
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  return toIsoDate(tomorrow)
}

const daysBetween = (start: string, end: string) => {
  const ms = new Date(`${end}T00:00:00`).getTime() - new Date(`${start}T00:00:00`).getTime()
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)) + 1)
}

const formatDays = (days: number) => `${days} day${days === 1 ? "" : "s"}`

// Per-hour bookings have no daily cutoff — only the "at least 1 hour from
// now" rule (enforced authoritatively on the backend). So, unlike the
// day-type date picker, today is always a selectable date here.
const todayDate = () => toIsoDate(new Date())

// Same 1-hour-lead-time rule as the backend's authoritative check — this is
// a fast UX hint only, not the real gate (see create-labour-booking.ts).
const isAtLeastOneHourAhead = (dateStr: string, timeStr: string) => {
  if (!dateStr || !timeStr) return false
  const requested = new Date(`${dateStr}T${timeStr}`)
  const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000)
  return requested >= oneHourFromNow
}

// Per-hour bookings are only offered within business hours — same window
// as the backend's authoritative check (see create-labour-booking.ts).
const BUSINESS_START = "09:00"
const BUSINESS_END = "17:00"

const isWithinBusinessHours = (start: string, end: string) =>
  !!start && !!end && start >= BUSINESS_START && end <= BUSINESS_END

// A native <input type="time"> ignores min/max/step once its own picker UI
// opens (as seen live — Chrome's hour/minute/AM-PM columns scroll freely
// through the whole day), so the business-hours + 15-minute-increment
// constraint is only reliably enforced by replacing it with an explicit
// list of selectable times: "9:00 AM", "9:15 AM", … "5:00 PM".
const TIME_OPTIONS = (() => {
  const options: { value: string; label: string }[] = []
  const startMinutes = 9 * 60
  const endMinutes = 17 * 60
  for (let minutes = startMinutes; minutes <= endMinutes; minutes += 15) {
    const hours24 = Math.floor(minutes / 60)
    const mins = minutes % 60
    const value = `${String(hours24).padStart(2, "0")}:${String(mins).padStart(2, "0")}`
    const period = hours24 >= 12 ? "PM" : "AM"
    const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12
    options.push({ value, label: `${hours12}:${String(mins).padStart(2, "0")} ${period}` })
  }
  return options
})()

const hoursBetween = (start: string, end: string) => {
  if (!start || !end) return 0
  const [sh, sm] = start.split(":").map(Number)
  const [eh, em] = end.split(":").map(Number)
  const diffMinutes = eh * 60 + em - (sh * 60 + sm)
  return diffMinutes > 0 ? diffMinutes / 60 : 0
}

const formatHours = (hours: number) => {
  if (hours <= 0) return ""
  const rounded = Math.round(hours * 100) / 100
  const label = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
  return `${label} hour${rounded === 1 ? "" : "s"}`
}

const digitsOnly = (value: string) => value.replace(/\D/g, "").slice(0, 10)

const BookingModal = ({
  service,
  customer,
  isOpen,
  onClose,
}: {
  service: LabourService
  customer: HttpTypes.StoreCustomer | null
  isOpen: boolean
  onClose: () => void
}) => {
  const router = useRouter()
  const minDayDate = earliestDayDate()
  const minHourDate = todayDate()

  // A signed-in customer's default saved address, if any — same prefill
  // source checkout's ShippingAddress uses, so a returning customer sees
  // their address pre-filled here too instead of a blank form.
  const defaultAddress = customer?.addresses.find((a) => a.is_default_shipping)

  const [step, setStep] = useState<Step>("details")
  const [rateType, setRateType] = useState<RateType>("day")
  const [startDate, setStartDate] = useState(minDayDate)
  const [endDate, setEndDate] = useState(minDayDate)
  const [scheduledTime, setScheduledTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [numWorkersInput, setNumWorkersInput] = useState("1")
  const [name, setName] = useState(
    customer ? `${customer.first_name ?? ""} ${customer.last_name ?? ""}`.trim() : ""
  )
  const [email, setEmail] = useState(customer?.email ?? "")
  const [phone, setPhone] = useState(customer?.phone ? digitsOnly(customer.phone) : "")
  const [addressLine, setAddressLine] = useState(defaultAddress?.address_1 ?? "")
  const [landmark, setLandmark] = useState(defaultAddress?.company ?? "")
  const [city, setCity] = useState(defaultAddress?.city ?? "")
  const [postalCode, setPostalCode] = useState(defaultAddress?.postal_code ?? "")
  // The saved address the fields currently hold (the default one pre-fills
  // them), or null once the customer types over it or has none. Tracked
  // explicitly because this form doesn't hold every field a saved address has,
  // so the picker can't tell by comparing.
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    defaultAddress?.id ?? null
  )
  const [paymentMethod, setPaymentMethod] = useState<PaymentChoice>("upi")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [creatingAccount, setCreatingAccount] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)
  // Drives the "Number of people" field's error highlight — only shown
  // after the first attempt to continue, not on first render.
  const [attemptedContinue, setAttemptedContinue] = useState(false)

  // Fast, non-blocking feedback for delivery-area coverage, same pattern as
  // checkout's ShippingAddress — the authoritative check runs server-side
  // in create-labour-booking's workflow when the booking is submitted.
  const [pincodeNotice, setPincodeNotice] = useState<string | null>(null)
  const [checkingPincode, setCheckingPincode] = useState(false)

  const handlePincodeBlur = async () => {
    const pincode = postalCode.trim()
    if (pincode.length !== 6) {
      setPincodeNotice(null)
      return
    }

    setCheckingPincode(true)
    try {
      const serviceable = await checkPincodeServiceable(pincode)
      setPincodeNotice(
        serviceable ? null : `We don't currently serve pincode ${pincode}.`
      )
    } catch {
      setPincodeNotice(null)
    } finally {
      setCheckingPincode(false)
    }
  }

  const handleAddressSelect = (address?: HttpTypes.StoreCartAddress) => {
    if (!address) return
    setSelectedAddressId((address as { id?: string }).id ?? null)
    setAddressLine(address.address_1 ?? "")
    setLandmark(address.company ?? "")
    setCity(address.city ?? "")
    setPostalCode(address.postal_code ?? "")
    if (address.phone) {
      setPhone(digitsOnly(address.phone))
    }
  }

  const numWorkers = Number(numWorkersInput) || 0
  const durationHours = hoursBetween(scheduledTime, endTime)

  const reset = () => {
    setStep("details")
    setError(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const estimatedTotal =
    rateType === "day"
      ? service.perDayRate * daysBetween(startDate, endDate) * numWorkers
      : service.perHourRate * durationHours * numWorkers

  // Isolated from the rest of validateDetails so both the error message and
  // the start/end time fields' red highlight can share one source of truth.
  const validateHourTime = () => {
    if (!scheduledTime || !endTime) {
      return "Please choose a start and end time."
    }
    if (!isAtLeastOneHourAhead(startDate, scheduledTime)) {
      return "Per-hour bookings must be made at least 1 hour before the start time."
    }
    if (durationHours <= 0) {
      return "End time must be after the start time."
    }
    if (!isWithinBusinessHours(scheduledTime, endTime)) {
      return "Per-hour bookings are only available between 9:00 AM and 5:00 PM."
    }
    if (durationHours < service.minBookingHours) {
      return `This service requires a minimum of ${service.minBookingHours} hour${
        service.minBookingHours === 1 ? "" : "s"
      }.`
    }
    return null
  }

  const validateDetails = () => {
    if (!addressLine.trim() || !city.trim() || !postalCode.trim()) {
      return "Please fill in the address, city, and postal code."
    }
    if (!/^\d{6}$/.test(postalCode.trim())) {
      return "Please enter a valid 6-digit postal code."
    }
    if (!name.trim()) {
      return "Please enter a name."
    }
    // Required whenever the phone isn't already a signed-in customer's own
    // — a brand-new number's signup step needs a valid email to create the
    // account (see completePhoneSignup / handleNewPhone below); an existing
    // customer doesn't need one, but a provided value must still be valid.
    if (!customer && !email.trim()) {
      return "Please enter an email address."
    }
    if (email.trim() && !isValidEmail(email)) {
      return "Please enter a valid email address."
    }
    if (phone.length !== 10) {
      return "Please enter a valid 10-digit phone number."
    }
    if (!numWorkersInput.trim() || numWorkers < 1) {
      return "Please enter the number of people (at least 1)."
    }
    if (numWorkers > MAX_WORKERS_PER_BOOKING) {
      return `For more than ${MAX_WORKERS_PER_BOOKING} people, please call us.`
    }
    if (rateType === "hour") {
      return validateHourTime()
    }
    return null
  }

  const goToPaymentOrVerify = async () => {
    setAttemptedContinue(true)
    const validationError = validateDetails()
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)

    // The area is checked HERE, not only when the field is left: the on-blur
    // note is advisory (and never runs for a saved or prefilled address), so
    // an unserved pincode used to get all the way to "Confirm Booking" before
    // being refused. The server still checks it again on submit. If the check
    // itself can't be answered, carry on and let that server check decide.
    setCheckingPincode(true)
    let serviceable = true
    try {
      serviceable = await checkPincodeServiceable(postalCode.trim())
    } catch {
      // not answerable now — the server enforces it at submit
    } finally {
      setCheckingPincode(false)
    }
    if (!serviceable) {
      const notice = `We don't currently serve pincode ${postalCode.trim()}.`
      setPincodeNotice(notice)
      setError(notice)
      return
    }
    setPincodeNotice(null)

    if (customer) {
      setStep("payment")
      return
    }

    // A new phone number becomes an account using this email, which fails if
    // another account already has it. Say so now, before an OTP is sent.
    setCheckingEmail(true)
    const emailTaken = await emailBlocksSignup(email.trim(), phone)
    setCheckingEmail(false)
    if (emailTaken) {
      setError(EMAIL_TAKEN_MESSAGE)
      return
    }
    setStep("verify")
  }

  const numWorkersTooMany = numWorkers > MAX_WORKERS_PER_BOOKING
  const numWorkersInvalid =
    attemptedContinue && (!numWorkersInput.trim() || numWorkers < 1)
  const hourTimeInvalid =
    attemptedContinue && rateType === "hour" && validateHourTime() !== null

  const handleNewPhone = async ({ phone: verifiedPhone, token }: { phone: string; token: string }) => {
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
      setError(result.error)
      return
    }

    setStep("payment")
  }

  const handleSubmit = async () => {
    setError(null)
    setSubmitting(true)
    try {
      const booking = await createLabourBooking({
        service_slug: service.slug,
        rate_type: rateType,
        start_date: startDate,
        end_date: rateType === "day" ? endDate : undefined,
        scheduled_time: rateType === "hour" ? scheduledTime : undefined,
        duration_hours: rateType === "hour" ? durationHours : undefined,
        num_workers: numWorkers,
        address_1: addressLine,
        landmark: landmark || undefined,
        city,
        postal_code: postalCode,
        phone,
        email: email || undefined,
        payment_method: paymentMethod,
      })
      router.push(`/labour/bookings/${booking.id}/confirmed`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't submit the booking")
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} close={handleClose} size="medium" data-testid="booking-modal">
      <Modal.Title>
        <Heading className="mb-1">Book {service.name}</Heading>
      </Modal.Title>
      <div className="max-h-[60vh] overflow-y-auto px-1">
        {creatingAccount ? (
          <Text className="text-center text-small-regular text-ui-fg-subtle py-8">
            Creating your account…
          </Text>
        ) : step === "details" ? (
          <div className="flex flex-col gap-y-4">
            <div role="radiogroup" className="flex gap-x-3">
              {(["day", "hour"] as RateType[]).map((option) => (
                <label
                  key={option}
                  className={`flex-1 text-center border rounded-md py-2 cursor-pointer ${
                    rateType === option
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="rate-type"
                    className="sr-only"
                    checked={rateType === option}
                    onChange={() => {
                      setRateType(option)
                      // Each rate type has its own earliest-valid date (the
                      // 8:30 AM same-day cutoff only applies to day-type
                      // bookings) — bump the selected date forward if it's
                      // now before what the new type allows.
                      if (option === "day") {
                        setStartDate((d) => (d < minDayDate ? minDayDate : d))
                        setEndDate((d) => (d < minDayDate ? minDayDate : d))
                      } else {
                        setStartDate((d) => (d < minHourDate ? minHourDate : d))
                      }
                    }}
                  />
                  {option === "day" ? "Per Day" : "Per Hour"}
                  <Text className="txt-small text-ui-fg-subtle">
                    ₹{option === "day" ? service.perDayRate : service.perHourRate}
                  </Text>
                </label>
              ))}
            </div>

            {rateType === "day" ? (
              <div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block txt-medium-plus text-ui-fg-base mb-1">
                      Start date
                    </label>
                    <input
                      type="date"
                      min={minDayDate}
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value)
                        if (e.target.value > endDate) setEndDate(e.target.value)
                      }}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                      data-testid="start-date-input"
                    />
                  </div>
                  <div>
                    <label className="block txt-medium-plus text-ui-fg-base mb-1">
                      End date
                    </label>
                    <input
                      type="date"
                      min={startDate}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                      data-testid="end-date-input"
                    />
                  </div>
                </div>
                <Text
                  className="txt-medium-plus text-brand-600 mt-1"
                  data-testid="day-count-label"
                >
                  {formatDays(daysBetween(startDate, endDate))}
                </Text>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block txt-medium-plus text-ui-fg-base mb-1">Date</label>
                    <input
                      type="date"
                      min={minHourDate}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                      data-testid="hour-date-input"
                    />
                  </div>
                  <div>
                    <label className="block txt-medium-plus text-ui-fg-base mb-1">
                      Start time
                    </label>
                    <select
                      value={scheduledTime}
                      onChange={(e) => {
                        const newStart = e.target.value
                        setScheduledTime(newStart)
                        // The end-time dropdown only lists times after the
                        // start time — clear a now-stale selection instead
                        // of leaving an end time that's no longer offered.
                        if (endTime && endTime <= newStart) {
                          setEndTime("")
                        }
                      }}
                      className={`border rounded-md px-3 py-2 text-sm w-full bg-white ${
                        hourTimeInvalid ? "border-rose-500 bg-rose-50" : "border-gray-300"
                      }`}
                      data-testid="hour-time-input"
                    >
                      <option value="">Select time</option>
                      {TIME_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block txt-medium-plus text-ui-fg-base mb-1">
                      End time
                    </label>
                    <select
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className={`border rounded-md px-3 py-2 text-sm w-full bg-white ${
                        hourTimeInvalid ? "border-rose-500 bg-rose-50" : "border-gray-300"
                      }`}
                      data-testid="hour-end-time-input"
                    >
                      <option value="">Select time</option>
                      {TIME_OPTIONS.filter(
                        (option) => !scheduledTime || option.value > scheduledTime
                      ).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {durationHours > 0 && (
                  <Text
                    className="txt-medium-plus text-brand-600 mt-1"
                    data-testid="hour-count-label"
                  >
                    {formatHours(durationHours)}
                  </Text>
                )}
              </div>
            )}

            <div>
              <label className="block txt-medium-plus text-ui-fg-base mb-1">
                Number of people
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={numWorkersInput}
                onChange={(e) => setNumWorkersInput(e.target.value.replace(/\D/g, "").slice(0, 2))}
                className={`border rounded-md px-3 py-2 text-sm w-full ${
                  numWorkersInvalid || numWorkersTooMany
                    ? "border-rose-500 bg-rose-50"
                    : "border-gray-300"
                }`}
                data-testid="num-workers-input"
              />
              {numWorkersTooMany ? (
                <Text
                  className="text-rose-500 txt-small mt-1"
                  data-testid="num-workers-error"
                >
                  For more than {MAX_WORKERS_PER_BOOKING} people, please call us.
                </Text>
              ) : (
                numWorkersInvalid && (
                  <Text
                    className="text-rose-500 txt-small mt-1"
                    data-testid="num-workers-error"
                  >
                    Please enter the number of people (at least 1).
                  </Text>
                )
              )}
            </div>

            <Input
              label="Name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-testid="booking-name-input"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-testid="booking-email-input"
            />
            <Input
              label="Phone number"
              name="phone"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(digitsOnly(e.target.value))}
              data-testid="booking-phone-input"
            />
            {customer && (customer.addresses?.length || 0) > 0 && (
              <SavedAddressPicker
                heading={
                  customer.first_name
                    ? `Hi ${customer.first_name}, do you want to use one of your saved addresses?`
                    : "Do you want to use one of your saved addresses?"
                }
                addresses={customer.addresses}
                addressInput={
                  {
                    address_1: addressLine,
                    company: landmark,
                    city,
                    postal_code: postalCode,
                    phone,
                  } as unknown as HttpTypes.StoreCartAddress
                }
                selectedId={selectedAddressId}
                onSelect={handleAddressSelect}
              />
            )}
            <Input
              label="Address"
              name="address"
              value={addressLine}
              onChange={(e) => {
                setAddressLine(e.target.value)
                setSelectedAddressId(null)
              }}
              data-testid="booking-address-input"
            />
            <Input
              label="Landmark"
              name="landmark"
              value={landmark}
              onChange={(e) => {
                setLandmark(e.target.value)
                setSelectedAddressId(null)
              }}
              data-testid="booking-landmark-input"
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="City"
                name="city"
                value={city}
                onChange={(e) => {
                  setCity(e.target.value)
                  setSelectedAddressId(null)
                }}
                data-testid="booking-city-input"
              />
              <div>
                <Input
                  label="Postal code"
                  name="postal_code"
                  inputMode="numeric"
                  value={postalCode}
                  onChange={(e) => {
                    setPostalCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    setSelectedAddressId(null)
                  }}
                  onBlur={handlePincodeBlur}
                  data-testid="booking-postal-code-input"
                />
                {checkingPincode && (
                  <Text
                    className="text-ui-fg-subtle txt-small mt-1"
                    data-testid="booking-pincode-checking-message"
                  >
                    Checking service availability...
                  </Text>
                )}
                {!checkingPincode && pincodeNotice && (
                  <Text
                    className="text-rose-500 txt-small mt-1"
                    data-testid="booking-pincode-not-serviceable-message"
                  >
                    {pincodeNotice}
                  </Text>
                )}
              </div>
            </div>

            <Text className="txt-large-plus text-brand-600 bg-brand-50 border border-brand-100 rounded-md px-4 py-3">
              Estimated total: ₹{estimatedTotal}
            </Text>

            <ErrorMessage error={error} variant="banner" data-testid="booking-details-error" />
            <Button
              onClick={goToPaymentOrVerify}
              isLoading={checkingEmail || checkingPincode}
              data-testid="booking-continue-button"
            >
              Continue
            </Button>
          </div>
        ) : step === "verify" ? (
          <div data-testid="booking-verify-step">
            <Text className="txt-medium-plus text-ui-fg-base mb-4">
              Verify your phone number to continue.
            </Text>
            <PhoneLogin
              signupEmail={email.trim() || undefined}
              onVerified={() => setStep("payment")}
              onNewPhone={handleNewPhone}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-y-4" data-testid="booking-payment-step">
            <Text className="txt-medium-plus text-ui-fg-base">
              Choose how you would like to pay.
            </Text>
            <div role="radiogroup" className="flex flex-col gap-y-3">
              {(
                [
                  { value: "upi" as PaymentChoice, label: "Pay online with UPI", description: "Scan a QR code or pay in your UPI app after booking." },
                  { value: "cod" as PaymentChoice, label: "Pay in cash", description: "Pay in cash once the work is done." },
                ]
              ).map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-x-3 border rounded-md p-4 cursor-pointer ${
                    paymentMethod === option.value
                      ? "border-brand-500 bg-brand-50"
                      : "border-gray-200"
                  }`}
                  data-testid={`booking-payment-${option.value}`}
                >
                  <input
                    type="radio"
                    name="booking-payment-method"
                    checked={paymentMethod === option.value}
                    onChange={() => setPaymentMethod(option.value)}
                    className="mt-1 accent-brand-500"
                  />
                  <span className="flex flex-col">
                    <span className="txt-medium-plus text-ui-fg-base">{option.label}</span>
                    <span className="txt-small text-ui-fg-subtle">{option.description}</span>
                  </span>
                </label>
              ))}
            </div>
            <Text className="txt-large-plus text-brand-600 bg-brand-50 border border-brand-100 rounded-md px-4 py-3">
              Estimated total:{" "}
              {convertToLocale({ amount: estimatedTotal, currency_code: "inr" })}
            </Text>
            <ErrorMessage error={error} variant="banner" data-testid="booking-payment-error" />
            <Button
              onClick={handleSubmit}
              isLoading={submitting}
              data-testid="booking-submit-button"
            >
              Confirm Booking
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}

export default BookingModal
