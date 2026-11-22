"use client"

import { useEffect, useState } from "react"
import { Button, Heading, Text } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"

const UPI_VPA = process.env.NEXT_PUBLIC_UPI_VPA
const UPI_PAYEE_NAME = process.env.NEXT_PUBLIC_UPI_PAYEE_NAME ?? "Construct Mitra"

type UpiPaymentProps = {
  amount: number
  currencyCode: string
  // Shown to the customer, e.g. "Order #27" or "Booking #01HX...".
  referenceLabel: string
  // Used as the UPI intent's transaction note — kept separate from
  // referenceLabel since it shouldn't contain a "#" or other UI formatting.
  transactionNote: string
  alreadyConfirmed?: boolean
  onConfirmPaid: () => Promise<unknown>
  viewHref: string
  viewLabel?: string
}

/**
 * Generic UPI QR / "Pay via UPI app" screen, shared by both order
 * confirmation (§2.4/§4.2) and labour-booking confirmation — neither is a
 * real payment capture; see each caller's own backend route for why. One
 * UPI intent string, two presentations chosen by a simple mobile check: a
 * tappable "Pay via UPI app" button on mobile (opens the customer's own UPI
 * app with the amount prefilled — a QR code is useless when the phone
 * showing it is also the phone that would have to scan it), or a QR code
 * image on desktop.
 *
 * "I've Paid" is a self-reported hint only (see each caller's backend
 * route) — it never captures a payment. Once clicked (now or on a prior
 * visit, via `alreadyConfirmed`), this swaps to a "pending verification"
 * message instead of showing the QR/button again.
 */
const UpiPayment = ({
  amount,
  currencyCode,
  referenceLabel,
  transactionNote,
  alreadyConfirmed = false,
  onConfirmPaid,
  viewHref,
  viewLabel = "View Order",
}: UpiPaymentProps) => {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(alreadyConfirmed)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const upiUri = UPI_VPA
    ? `upi://pay?pa=${encodeURIComponent(UPI_VPA)}&pn=${encodeURIComponent(
        UPI_PAYEE_NAME
      )}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`
    : null

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent))
  }, [])

  useEffect(() => {
    if (!upiUri || isMobile || confirmed) {
      return
    }

    let cancelled = false

    import("qrcode").then(({ default: QRCode }) => {
      QRCode.toDataURL(upiUri, { width: 240, margin: 1 }).then((url) => {
        if (!cancelled) {
          setQrDataUrl(url)
        }
      })
    })

    return () => {
      cancelled = true
    }
  }, [upiUri, isMobile, confirmed])

  if (!upiUri) {
    return null
  }

  const handleConfirmPaid = async () => {
    setError(null)
    setConfirming(true)
    try {
      await onConfirmPaid()
      setConfirmed(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setConfirming(false)
    }
  }

  if (confirmed) {
    return (
      <div
        className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center"
        data-testid="payment-verification-pending"
      >
        <Heading level="h2" className="text-2xl-regular mb-2 text-gray-900">
          Payment Verification Pending
        </Heading>
        <Text className="text-gray-600 mb-4">
          We&apos;ve received your request and are verifying your UPI payment.
        </Text>
        <Text className="text-gray-900 mb-1">
          <span className="font-semibold">{referenceLabel}</span>
        </Text>
        <Text className="text-gray-900 mb-6">
          Amount:{" "}
          <span className="font-semibold">
            {convertToLocale({ amount, currency_code: currencyCode })}
          </span>
        </Text>
        <Text className="text-gray-600 mb-6">
          You can safely leave this page. We&apos;ll update your status once
          payment is verified.
        </Text>
        <LocalizedClientLink href={viewHref}>
          <Button variant="secondary">{viewLabel}</Button>
        </LocalizedClientLink>
      </div>
    )
  }

  return (
    <div
      className="rounded-lg border border-gray-200 p-6 flex flex-col items-center text-center"
      data-testid="upi-payment-container"
    >
      <Text className="text-gray-600 mb-1">
        <span className="font-semibold">{referenceLabel}</span>
      </Text>
      <Heading level="h2" className="text-xl-semi mb-1 text-gray-900">
        Amount to Pay
      </Heading>
      <Text className="text-3xl font-bold text-gray-900 mb-6" data-testid="upi-amount">
        {convertToLocale({ amount, currency_code: currencyCode })}
      </Text>

      <Text className="txt-medium-plus text-gray-900 mb-4">Pay using UPI</Text>

      {isMobile ? (
        <a
          href={upiUri}
          className="inline-flex items-center justify-center rounded-md bg-brand-500 text-white hover:bg-brand-600 px-6 py-3 text-base font-medium"
          data-testid="upi-pay-button"
        >
          Pay via UPI app
        </a>
      ) : qrDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={qrDataUrl}
          alt="Scan this QR code with a UPI app to pay"
          data-testid="upi-qr-code"
          width={240}
          height={240}
        />
      ) : null}

      <Text className="text-gray-600 text-small-regular mt-4 mb-6">
        Pay to <span className="font-semibold">{UPI_VPA}</span> and
        reference <span className="font-semibold">{referenceLabel}</span>.
      </Text>

      <Button
        onClick={handleConfirmPaid}
        isLoading={confirming}
        data-testid="confirm-paid-button"
      >
        I&apos;ve Paid
      </Button>
      {error && (
        <Text className="text-rose-500 text-small-regular mt-2">{error}</Text>
      )}
    </div>
  )
}

export default UpiPayment
